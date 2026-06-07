import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/middleware';

import {
    getDashboardStats,
    toggleBanStatus,
    manualVerifyUser,
    getUserFullDetails,
    getOnlineUsers,
    broadcastAnnouncement,
    getAllListingsAdmin,
    adminDeleteListing,
    getConversationDetailsAdmin,
    sendAdminMessageToConversation
} from '../controllers/admin.controller';

const router = Router();

// Bütün admin rotaları önce giriş yapmış olmalı, sonra admin yetkisine sahip olmalı
router.use(authMiddleware, adminOnly);

// -- Dashboard & İstatistik --
router.get('/dashboard/stats', getDashboardStats);

// -- Sistem & Online Takibi --
router.get('/system/online-users', getOnlineUsers);
router.post('/system/broadcast', broadcastAnnouncement);

// -- Kullanıcı İşlemleri --
router.patch('/users/:identifier/ban', toggleBanStatus); // id veya username alabilir
router.patch('/users/:id/verify', manualVerifyUser);
router.get('/users/:id/details', getUserFullDetails);

// -- İlan Yönetimi --
router.get('/listings', getAllListingsAdmin);
router.delete('/listings/:id', adminDeleteListing);

// -- Mesajlaşma Müdahalesi --
router.get('/conversations/:convId', getConversationDetailsAdmin);
router.post('/conversations/:convId/send-message', sendAdminMessageToConversation);

export default router;