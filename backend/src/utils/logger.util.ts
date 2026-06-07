import { Request, Response } from "express";
import mongoose from "mongoose";
import { ActivityLog } from "../models/Log";

interface LogParams {
    req?: Request;                                 // IP ve Cihaz bilgisini otomatik çekmek için (opsiyonel)
    res?: Response;                                // res.locals.clientIp için (opsiyonel)
    actor?: mongoose.Types.ObjectId | string;      // İşlemi yapan kişi (opsiyonel - örn: register öncesi)
    action: string;                                // Ne yapıldı?
    entity_type?: string;                          // Hangi model üzerinde? (Listing, User vb.)
    entity_id?: mongoose.Types.ObjectId | string;  // O modelin ID'si
    metadata?: Record<string, any>;                // Ekstra veriler (email, hata detayı, ban sebebi vb.)
}

export const createActivityLog = async ({
                req,
                res,
                actor,
                action,
                entity_type = "None",
                entity_id,
                metadata = {}
            }: LogParams) => {
    try {
        // 1. Eğer req/res gönderilmişse IP ve User-Agent'ı otomatik yakala
        const autoMetadata: any = {};

        if (req || res) {
            const ip = res?.locals?.clientIp || req?.ip;
            const userAgent = req?.headers["user-agent"];

            if (ip) autoMetadata.ipAddress = ip;
            if (userAgent) autoMetadata.userAgent = userAgent;
        }

        // 2. Kullanıcının gönderdiği metadata ile otomatik yakalananları birleştir
        const finalMetadata = { ...autoMetadata, ...metadata };

        // 3. Veritabanına kaydet
        await ActivityLog.create({
            actor,
            action,
            entity_type,
            entity_id,
            // Eğer metadata objesi boşsa veritabanına undefined gitsin, gereksiz {} kaydetmesin
            metadata: Object.keys(finalMetadata).length > 0 ? finalMetadata : undefined
        });

    } catch (error) {
        // Loglama çökse bile ana akışı (örneğin adamın kayıt olmasını) durdurmamalı
        console.error("Aktivite loglanırken hata oluştu:", error);
    }
};