// src/models/ActivityLog.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
    actor: mongoose.Types.ObjectId;      // İşlemi yapan kişi (Normal user veya Admin)
    action: string;                      // Eylemin türü (örn: USER_LOGIN, LISTING_CREATED)
    entity_type?: string;                // Üzerinde işlem yapılan nesnenin türü (Listing, User, Conversation)
    entity_id?: mongoose.Types.ObjectId; // Üzerinde işlem yapılan nesnenin referans ID'si
    metadata?: any;                      // Esnek alan: IP adresi, cihaz bilgisi, ban sebebi vb.
}

const ActivityLogSchema = new Schema({
    actor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            // ─── AUTH & KULLANICI İŞLEMLERİ ───
            "PROFILE_UPDATED",
            "LISTING_FAVORITED",
            "LISTING_UNFAVORITED",
            "LISTING_SAVED",
            "LISTING_UNSAVED",
            "USER_LOGIN",
            "SEND_VERIFY_EMAIL",             // İlk kayıt adımı (verilerin backend'e ilk gelişi)
            "COMPLETE_PROFILE",              // Profil tamamlama adımı
            "FORGOT_PASSWORD",               // Şifremi unuttum isteği
            "EDU_EMAIL_VERIFICATION_SENT",   // Edu mail doğrulama kodu gönderildi
            "EDU_EMAIL_VERIFIED",            // Edu mail başarıyla onaylandı

            // ─── İLAN İŞLEMLERİ ───
            "LISTING_CREATED",
            "LISTING_UPDATED",
            "LISTING_DELETED",

            // ─── YORUM İŞLEMLERİ ───
            "COMMENT_CREATED",
            "COMMENT_UPDATED",
            "COMMENT_DELETED",

            // ─── TEKLİF (OFFER) İŞLEMLERİ ───
            "OFFER_SENT",
            "OFFER_ACCEPTED",
            "OFFER_REJECTED",
            "OFFER_CANCELLED",

            // ─── MESAJLAŞMA ───
            "CONVERSATION_STARTED",
            "MESSAGE_SENT",
            "MESSAGE_DELETED",

            // ─── ADMİN İŞLEMLERİ ───
            "USER_BANNED",
            "USER_UNBANNED"
        ]
    },
    entity_type: {
        type: String,
        // Hangi koleksiyonla ilişkili olduğunu belirtiyoruz
        enum: ["Listing", "User", "Conversation", "Message", "Offer", "Comment", "None"],
        default: "None"
    },
    entity_id: {
        type: Schema.Types.ObjectId
        // Ref vermiyoruz çünkü ref kısmı entity_type'a göre dinamik değişecek (Polymorphic)
    },
    metadata: {

        type: Schema.Types.Mixed
        // Örneğin login ise { ipAddress: "192.168.1.1", device: "Mobile" }
        // Ban işlemi ise { reason: "Spam yaptı" }

    }
}, { timestamps: true });

ActivityLogSchema.index({ "metadata.email": 1 }, { sparse: true });

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);