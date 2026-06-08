import { Request, Response } from 'express'
import { Listing } from "../models/Listing"
import User from "../models/User"
import Offer from "../models/Offer"
import { uploadMultiple, deleteFile } from '../utils/cloudinary/uploader.util';
import { createListingSchema, updateListingSchema } from '../validators/listing.validator'
import { createActivityLog } from "../utils/logger.util";
import {z} from "zod";
import {IUser} from "../types/user.types";

/**
 * Helper Func: Cloudinary URL'den publicId'yi çıkarır
 * Örn: "https://res.cloudinary.com/xxx/image/upload/v1234/folder/file.jpg" -> "folder/file"
 */
const getPublicIdFromUrl = (url: string) => {
    const parts = url.split('/');
    const fileWithExtension = parts.pop(); // file.jpg
    const folderPath = parts.slice(parts.indexOf('upload') + 2).join('/'); // v1234'ü de atla
    const fileName = fileWithExtension?.split('.')[0]; // extension'ı at
    return folderPath ? `${folderPath}/${fileName}` : fileName || '';
}

// ─── CREATE ────────────────────────────────────────────────────────────────

export const createListing = async (req: Request, res: Response): Promise<any> => {
    try {
        if (typeof req.body.features === 'string') {
            try { req.body.features = JSON.parse(req.body.features) } catch (e) { /* ignore */ }
        }

        const parsed = createListingSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                errors: z.treeifyError(parsed.error)
            });
        }

        const files = req.files as Express.Multer.File[]
        let photos: string[] = []

        if (files?.length) {
            const uploaded = await uploadMultiple(files, 'listingPhoto')
            photos = uploaded.map(f => f.url)
        }

        let expiresDate = new Date();
        if (parsed.data.is_urgent) {
            expiresDate.setHours(expiresDate.getHours() + (parsed.data.expires || 24) ); // Acil ilanlar 24 saat
        } else {
            expiresDate.setMonth(expiresDate.getMonth() + 1); // Normal ilanlar 1 ay
        }

        const listing = await Listing.create({
            ...parsed.data,
            expires: expiresDate,
            photos,
            owner: req.userId,
        })

        await createActivityLog({
            req, res,
            actor: req.userId,
            action: "LISTING_CREATED",
            entity_type: "Listing",
            entity_id: listing._id
        });

        return res.status(201).json({ listing })
    } catch (error) {
        console.error('Create listing error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}

// ─── GET ONE ───────────────────────────────────────────────────────────────

export const getListing = async (req: Request, res: Response): Promise<any> => {
    try {
        let listing = await Listing.findById(req.params.id).populate('owner', 'username avatar account_type is_verified');

        if (!listing)
            return res.status(404).json({ error: 'Listing not found' })

        // varsayılan IUser arayüzünün bunlara sahip olduğunu varsayıyoruz:
        // interface IUser { account_type: string; favorite_listings: Types.ObjectId[] | string[]; }

        let isStudent = false;
        let isVerifiedStudent = false;
        let is_favorited = false;

        // LeanDocument yerine doğrudan IUser tipini veya Mongoose'un otomatik çıkarımını kullanabilirsin
        let currentUser: IUser | null = null;

        if (req.userId) {
            currentUser = await User.findById(req.userId).lean<IUser>();

            if (currentUser) {
                isStudent = currentUser.account_type === 'student';


                // is the listing favorited control
                if (currentUser.favorite_listings) {
                    is_favorited = currentUser.favorite_listings.some(
                        (id) => id.toString() === req.params.id
                    );
                }
            }else {
                return res.status(404).json({ error: 'User not found' });
            }
        }

        // owner populate edildiği için _id sini string olarak alıyoruz
        const ownerId = (listing.owner as any)?._id?.toString() || listing.owner?.toString();
        const isOwner = (req.userId === ownerId);

        // Öğrenci değilse ve ilanın sahibi değilse RET!
        if (!isStudent && !isOwner) {
            // return res.status(403).json({ error: 'Sadece öğrenciler veya ilanın sahibi bu ilanı görüntüleyebilir.' });
            return res.status(403).json({ error: 'Only students or the owner of the listing can view this listing.' });
        }

        // 2. Yetki verildikten sonra views (görüntülenme) sayısını artır
        await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        listing.views += 1;

        // --- FETCH OFFER STATUS FOR THIS USER ---
        let offerStatus = null;
        if (req.userId && !isOwner) {
            const existingOffer = await Offer.findOne({ listing: req.params.id, applicant: req.userId }).select('status');
            if (existingOffer) {
                offerStatus = existingOffer.status;
            }
        }

        return res.json({ listing: { ...listing.toObject(), offerStatus }, is_favorited })
    } catch (error) {
        console.error('Get listing error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}

// ─── GET MANY (search + filter) ────────────────────────────────────────────

export const getListings = async (req: Request, res: Response): Promise<any> => {
    try {
        const { q, type, category, sort = 'newest', page = '1', limit = '20' } = req.query

        // Sayısal değerleri güvenli formata çevirme
        const pageNum = Math.max(1, Number(page) || 1)
        const limitNum = Math.max(1, Number(limit) || 20)

        const filter: Record<string, any> = {
            status: 'active',
            is_deleted: { $ne: true },
            $or: [
                { expires: { $gt: new Date() } },
                { expires: { $exists: false } } // Eskiden kalma, expires değeri olmayan test ilanlarını da göstermek için
            ]
        }

        if (q)        filter.$text     = { $search: q as string }
        if (type)     filter.type      = type
        if (category) filter.category  = category

        const sortMap: Record<string, any> = {
            newest:     { createdAt: -1 },
            oldest:     { createdAt:  1 },
            price_asc:  { price:   1 },
            price_desc: { price:  -1 },
            popular:    { views: -1 },
        }

        const listings = await Listing
            .find(filter)
            .sort(sortMap[sort as string] ?? sortMap.newest)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('owner', 'username avatar')

        return res.json({ listings, page: pageNum })
    } catch (error) {
        console.error('Get listings error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}

// ─── FEED ──────────────────────────────────────────────────────────────────

export const getFeedListings = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page = '1', limit = '20' } = req.query

        // Güvenli Sayfalama
        const pageNum = Math.max(1, Number(page) || 1)
        const limitNum = Math.max(1, Number(limit) || 20)

        const listings = await Listing
            .find({
                status: 'active',
                is_urgent: false,
                is_deleted: { $ne: true },
                $or: [
                    { expires: { $gt: new Date() } },
                    { expires: { $exists: false } }
                ]
            })
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('owner', 'username profile_photo')

        return res.json({ listings, page: pageNum })
    } catch (error) {
        console.error('Get feed listings error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}

// ─── USER LISTINGS ─────────────────────────────────────────────────────────

export const getUserListings = async (req: Request, res: Response): Promise<any> => {
    try {
        const listings = await Listing
            .find({
                owner: req.params.uID,
                status: 'active',
                is_deleted: { $ne: true },
                $or: [
                    { expires: { $gt: new Date() } },
                    { expires: { $exists: false } }
                ]
            })
            .sort({ createdAt: -1 })

        return res.json({ listings })
    } catch (error) {
        console.error('Get user listings error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}

// ─── MY LISTINGS (OWNER'S LISTINGS) ────────────────────────────────────────

export const getMyListings = async (req: Request, res: Response): Promise<any> => {
    try {
        const listings = await Listing
            .find({ owner: req.userId, is_deleted: { $ne: true } })
            .sort({ createdAt: -1 })

        return res.json({ listings })
    } catch (error) {
        console.error('Get my listings error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}

// ─── UPDATE ────────────────────────────────────────────────────────────────

export const updateListing = async (req: Request, res: Response): Promise<any> => {
    try {
        const listing = await Listing.findById(req.params.id)
        if (!listing)
            return res.status(404).json({ error: 'Listing not found' })

        if (typeof req.body.features === 'string') {
            try { req.body.features = JSON.parse(req.body.features) } catch (e) { /* ignore */ }
        }

        const parsed = updateListingSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                errors: z.treeifyError(parsed.error)
            });
        }


        const files = req.files as Express.Multer.File[]

        // --- 1. Korunacak Resimleri Yakala ---
        // Kullanıcı silmek istemediği (korunacak) resimlerin URL'lerini yollayabilir
        let retainedPhotos: string[] = listing.photos || [];
        if (req.body.retainedPhotos !== undefined) {
            if (Array.isArray(req.body.retainedPhotos)) {
                retainedPhotos = req.body.retainedPhotos;
            } else {
                try {
                    // JSON formatında ('["url1", "url2"]') gelmişse parse et
                    retainedPhotos = JSON.parse(req.body.retainedPhotos);
                } catch (e) {
                    // Tek bir url string olarak gelmişse
                    retainedPhotos = [req.body.retainedPhotos];
                }
            }
        }

        // --- 2. Silinecek Resimleri Tespit ve Yok Et ---
        // Veritabanındaki eski resimler içinde dön; eğer korunacaklar listesinde YΟKSA, silinecek demektir
        const photosToDelete = (listing.photos || []).filter(url => !retainedPhotos.includes(url));

        if (photosToDelete.length > 0) {
            const deletePromises = photosToDelete.map(url => {
                const publicId = getPublicIdFromUrl(url);
                return deleteFile(publicId, 'image').catch(err => {
                    console.error('Silinmesi istenen eski resim silinirken hata:', err);
                });
            });
            await Promise.all(deletePromises);
        }

        // --- 3. Yeni Gelen Dosyaları Yükle ---
        let newlyUploadedUrls: string[] = [];
        if (files && files.length > 0) {
            const uploaded = await uploadMultiple(files, 'listingPhoto');
            newlyUploadedUrls = uploaded.map(f => f.url);
        }

        // --- 4. Son Fotoğraf Listesini Birleştir ---
        // Eğer kullanıcı fotoğraf değişikliği yapmışsa (eskilerden sildiği varsa ya da yeni eklediği varsa)
        if (req.body.retainedPhotos !== undefined || newlyUploadedUrls.length > 0) {

            // Eğer Frontend sıralamayı özel bir obje dizisi olarak yolladıysa (örn: orderedPhotos) o zaman sıralamayı frontend'den alırız.
            if (req.body.orderedPhotos) {
               try {
                  const order = JSON.parse(req.body.orderedPhotos);
                  // order = ["eski_url_2", "yeni_foto_index_0", "eski_url_5"] gibi

                  let newUploadIndex = 0;
                  listing.photos = order.map((item: string) => {
                       if (item === "NEW_UPLOAD") {
                          return newlyUploadedUrls[newUploadIndex++];
                       }
                       return item;
                  });
               } catch(e) {
                   listing.photos = [...retainedPhotos, ...newlyUploadedUrls];
               }
            } else {
               // Normal birleştirme
               listing.photos = [...retainedPhotos, ...newlyUploadedUrls];
            }
        }

        const updateData: any = { ...parsed.data };//TODO: BURADA DÜZELTME LAZIM EXPIRES KISMI
        if (updateData.expires !== undefined) {
            const expiresDate = new Date();
            expiresDate.setHours(expiresDate.getHours() + updateData.expires);
            updateData.expires = expiresDate;
        }

        Object.assign(listing, updateData)
        await listing.save()

        await createActivityLog({
            req, res,
            actor: req.userId,
            action: "LISTING_UPDATED",
            entity_type: "Listing",
            entity_id: listing._id
        });

        return res.json({ listing })
    } catch (error) {
        console.error('Update listing error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}

// ─── DELETE ────────────────────────────────────────────────────────────────

export const deleteListing = async (req: Request, res: Response): Promise<any> => {
    try {
        const listing = await Listing.findOne({
            _id: req.params.id,
            owner: req.userId,   // sadece sahibi silebilir
        })

        if (!listing)
            return res.status(404).json({ error: 'Listing not found' })

        // Artık Cloudinary fotoğraflarını sistemden silmiyoruz, Soft Delete yapıyoruz
        // çünkü konuşmalarda veya geçmiş referanslarda kullanılabilir
        listing.is_deleted = true;
        listing.status = 'closed';
        await listing.save();

        await createActivityLog({
            req, res,
            actor: req.userId,
            action: "LISTING_DELETED",
            entity_type: "Listing",
            entity_id: listing._id
        });

        return res.json({ message: 'Listing deleted (soft)' })
    } catch (error) {
        console.error('Delete listing error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}

export const republishListing = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // İlanı ve sahibini bul (Sadece kendi ilanını yenileyebilir)
        const listing = await Listing.findOne({ _id: id, owner: req.userId });

        if (!listing) {
            return res.status(404).json({ error: 'İlan bulunamadı veya yetkiniz yok.' });
        }

        // 1. KURAL: İlan zaten aktifse işlem yapma
        if (listing.status === 'active') {
            return res.status(400).json({ error: 'Bu ilan zaten aktif durumda.' });
        }

        const now = new Date();

        // İlanın süresinin bitip bitmediğini kontrol et
        // (Tarih geçmiş olabilir VEYA cron job vs. statüsünü 'expired' yapmış olabilir)
        const isExpired = !listing.expires || listing.expires <= now || listing.status === 'expired';

        if (isExpired) {
            // 3. KURAL: Süresi dolmuşsa zamanı güncelle
            const expiresDate = new Date();
            if (listing.is_urgent) {
                expiresDate.setHours(expiresDate.getHours() + 24); // Acil ilanlara +24 Saat
            } else {
                expiresDate.setMonth(expiresDate.getMonth() + 1); // Normal ilanlara +1 Ay
            }
            listing.expires = expiresDate;
        }
        // 2. KURAL: Süresi dolmamışsa (else durumu), yukarıdaki if bloğuna girmez
        // ve listing.expires tarihi olduğu gibi kalır. Sadece statüsü değişir.

        // İlanı tekrar aktif et
        listing.status = 'active';
        listing.is_deleted = false; // Soft delete yapıldıysa geri al
        await listing.save();

        // ++ LOGLAMA ++
        await createActivityLog({
            req, res, actor: req.userId,
            action: "LISTING_REPUBLISHED" as any,
            entity_type: "Listing", entity_id: listing._id,
            metadata: {
                newExpiresDate: listing.expires,
                wasExpired: isExpired // Loglarda ilan süresi bittiği için mi uzatıldı görmek isteyebilirsin
            }
        });

        const message = isExpired
            ? 'İlan süresi uzatıldı ve başarıyla yeniden yayınlandı.'
            : 'İlanınız tekrar aktif edildi.';

        return res.json({ message, listing });
    } catch (error) {
        console.error('Republish listing error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};