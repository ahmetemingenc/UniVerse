import {Router} from 'express'
import * as OC from '../controllers/offer.controller'
import {authMiddleware, studentOnly} from "../middleware/middleware";
import {checkListingAgreement} from "../controllers/offer.controller";

const router = Router()


// POST   /api/offer/apply                           → Job/Scholarship başvuru
router.post('/apply',              authMiddleware, studentOnly, OC.applyToListing)

// POST   /api/offer/make                            → Conversation içi fiyat teklifi
router.post('/make',               authMiddleware, OC.makeOffer)

// GET    /api/offer/my-applications                 → Benim başvurularım
router.get('/my-applications',     authMiddleware, OC.getMyApplications)

// GET    /api/offer/listing/:listingId/applications → İlana gelen başvurular (ilan sahibi)
router.get(
    '/listing/:listingId/applications', authMiddleware, OC.getListingApplications)

// PATCH  /api/offer/:offerId/respond                → Kabul / Red
router.patch('/:offerId/respond',  authMiddleware, OC.respondToOffer)

// PATCH  /api/offer/:offerId/cancel                 → İptal
router.patch('/:offerId/cancel',   authMiddleware, OC.cancelOffer)

// GET  /api/offer/check-agreement/:listingId                 → Check the offers for any agreement in the listing
router.get("/check-agreement/:listingId", authMiddleware, checkListingAgreement);

export default router