import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { Listing } from '../models/Listing';
import Comment from '../models/Comment';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Offer from '../models/Offer';
import { ActivityLog } from '../models/Log';
import { createActivityLog } from '../utils/logger.util';
import { emitNewMessage, emitSystemAnnouncement, onlineUsersMap } from '../Socket/Socket';

// ─── 1. DASHBOARD İSTATİSTİKLERİ ─────────────────────────────────────────────
export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [totalUsers, newUsersThisWeek, activeListings, totalConversations, totalOffers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: last7Days } }),
            Listing.countDocuments({ status: 'active', is_deleted: { $ne: true } }),
            Conversation.countDocuments(),
            Offer.countDocuments()
        ]);

        return res.json({
            users: { total: totalUsers, newThisWeek: newUsersThisWeek },
            listings: { active: activeListings },
            activity: { totalConversations, totalOffers }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─── 2. KULLANICI YÖNETİMİ (BAN / UNBAN / DETAY / MANUEL ONAY) ───────────────
export const toggleBanStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { identifier } = req.params;
        const isObjectId = mongoose.Types.ObjectId.isValid(identifier as string);
        const query = isObjectId ? { _id: identifier } : { username: identifier };

        const targetUser = await User.findOne(query);
        if (!targetUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        if (targetUser.is_admin) return res.status(403).json({ error: 'Başka bir admini banlayamazsınız!' });

        targetUser.is_banned = !targetUser.is_banned;
        await targetUser.save();

        await createActivityLog({
            req, res, actor: req.userId,
            action: targetUser.is_banned ? "USER_BANNED" : "USER_UNBANNED",
            entity_type: "User", entity_id: targetUser._id,
            metadata: { targetUsername: targetUser.username }
        });

        return res.json({ message: targetUser.is_banned ? 'Kullanıcı banlandı' : 'Ban açıldı', is_banned: targetUser.is_banned });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const manualVerifyUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        if (user.is_verified) return res.status(400).json({ error: 'Kullanıcı zaten onaylı.' });

        user.is_verified = true;
        await user.save();

        await createActivityLog({
            req, res, actor: req.userId, action: "EDU_EMAIL_VERIFIED",
            entity_type: "User", entity_id: user._id,
            metadata: { manualVerificationByAdmin: true }
        });

        return res.json({ message: 'Kullanıcı manuel olarak onaylandı.', user });
    } catch (error) {
        console.error("Manual Verify Error:", error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const getUserFullDetails = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        const [logs, listings, comments, conversations] = await Promise.all([
            ActivityLog.find({ actor: id }).sort({ createdAt: -1 }).limit(100),
            Listing.find({ owner: id }).select('title type status is_deleted createdAt'),
            Comment.find({ author: id }).select('content is_deleted createdAt listing target'),
            Conversation.find({
                $or: [
                    { seller: id },
                    { buyer: id }
                ]
            })
                .select('_id listing seller buyer status offerStatus createdAt updatedAt')
                // Frontend'de "X ilanı için Ahmet ile yapılan sohbet" diye şık gösterebilmek için populate ekledim:
                .populate('listing', 'title type')
                .populate('seller', 'username')
                .populate('buyer', 'username')
                .sort({ updatedAt: -1 })
        ]);

        return res.json({ user, logs, listings, comments, conversations });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─── 3. ONLİNE TAKİBİ VE SİSTEM DUYURUSU ─────────────────────────────────────
export const getOnlineUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const onlineArray = Array.from(onlineUsersMap.entries()).map(([userId, data]) => ({
            userId, ip: data.ip, connectedAt: data.connectedAt
        }));

        const userIds = onlineArray.map(u => u.userId);
        const usersInfo = await User.find({ _id: { $in: userIds } }).select('username name surname account_type profile_photo');

        const enrichedOnlineUsers = onlineArray.map(online => ({
            ...online,
            userInfo: usersInfo.find(u => u._id.toString() === online.userId) || null
        }));

        return res.json({ totalOnline: onlineUsersMap.size, users: enrichedOnlineUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const broadcastAnnouncement = async (req: Request, res: Response): Promise<any> => {
    try {
        const { title, message } = req.body;
        if (!title || !message) return res.status(400).json({ error: 'Başlık ve mesaj zorunludur.' });

        emitSystemAnnouncement(title, message);

        await createActivityLog({
            req, res, actor: req.userId, action: "SYSTEM_BROADCAST" as any,
            entity_type: "None", metadata: { title, message }
        });

        return res.json({ success: true, message: 'Duyuru tüm online kullanıcılara başarıyla iletildi.' });
    } catch (error) {
        console.error("Broadcast Error:", error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─── 4. İLAN YÖNETİMİ ────────────────────────────────────────────────────────
export const getAllListingsAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page = '1', limit = '50', showDeleted } = req.query;
        const filter: any = showDeleted === 'true' ? { is_deleted: true } : {};

        const listings = await Listing.find(filter)
            .sort({ createdAt: -1 })
            .skip((Math.max(1, Number(page)) - 1) * Number(limit))
            .limit(Number(limit))
            .populate('owner', 'username is_banned');

        const total = await Listing.countDocuments(filter);
        return res.json({ listings, total, page: Number(page) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const adminDeleteListing = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) return res.status(404).json({ error: 'İlan bulunamadı' });

        listing.is_deleted = true;
        listing.status = 'closed';
        await listing.save();

        await createActivityLog({
            req, res, actor: req.userId, action: "LISTING_DELETED",
            entity_type: "Listing", entity_id: listing._id, metadata: { deletedByAdmin: true }
        });

        return res.json({ message: 'İlan admin tarafından silindi (Soft Delete)' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─── 5. SOHBETLERE MÜDAHALE ──────────────────────────────────────────────────
export const getConversationDetailsAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { convId } = req.params;
        const conversation = await Conversation.findById(convId)
            .populate('seller', 'username')
            .populate('buyer', 'username')
            .populate('listing', 'title is_deleted');

        if (!conversation) return res.status(404).json({ error: 'Sohbet bulunamadı' });

        const messages = await Message.find({ conversation: convId })
            .sort({ createdAt: 1 })
            .populate('sender', 'username profile_photo');

        return res.json({ conversation, messages });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const sendAdminMessageToConversation = async (req: Request, res: Response): Promise<any> => {
    try {
        const { convId } = req.params;
        const { text } = req.body;

        const conversation = await Conversation.findById(convId);
        if (!conversation) return res.status(404).json({ error: 'Sohbet bulunamadı' });

        const message = await Message.create({
            conversation: convId, sender: req.userId, type: 'admin',
            text, photos: [], location: null, offer: null,
        });

        const populatedMsg = await message.populate('sender', 'username profile_photo is_admin');
        emitNewMessage(convId as string, populatedMsg);

        conversation.lastMessage = {
            senderId: new mongoose.Types.ObjectId(req.userId),
            senderName: 'SİSTEM MODERATÖRÜ',
            preview: text.slice(0, 50),
            type: 'admin', sentAt: new Date(), isRead: false, emailNotified: false
        };
        await conversation.save();

        await createActivityLog({
            req, res, actor: req.userId, action: "MESSAGE_SENT",
            entity_type: "Message", entity_id: message._id,
            metadata: { adminIntervention: true, conversationId: convId }
        });

        return res.status(201).json({ message: populatedMsg });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};