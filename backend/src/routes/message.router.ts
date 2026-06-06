import { Router } from 'express'
import multer     from 'multer'
import {authMiddleware, messagingLimiter} from '../middleware/middleware'
import * as MC from '../controllers/message.controller'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// POST   /api/message                          → Mesaj gönder (conversation yoksa oluşturur)
router.post(
    '/',
    messagingLimiter,
    authMiddleware,
    upload.array('photos', 5),
    MC.sendMessage
)

// GET    /api/message/conversations            → Tüm sohbetlerim
router.get(
    '/conversations',
    messagingLimiter,
    authMiddleware,
    MC.getConversations)

// GET    /api/message/:conversationId          → Sohbet mesajları (cursor-based)
router.get(
    '/:conversationId',
    messagingLimiter,
    authMiddleware,
    MC.getMessages)

// DELETE /api/message/:messageId               → Mesajı sil (soft)
router.delete(
    '/:messageId',
    messagingLimiter,
    authMiddleware,
    MC.deleteMessage)

export default router