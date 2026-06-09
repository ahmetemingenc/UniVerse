"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Heart, Settings, Trash2, Edit3, ExternalLink, User, MapPin, Calendar, AlertTriangle, X, CheckCircle, Star, Mail, Phone, GraduationCap, Shield, Loader2, RefreshCw, Briefcase, Camera, FileText, Bookmark, Folder, FolderOpen } from 'lucide-react';
interface Advert {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    type?: string;
    createdAt: string;
    owner: any;
    photos?: string[];
    status?: string;
    is_deleted?: boolean;
}

const TYPE_MAP: Record<string, string> = {
    secondhand: 'İkinci El',
    roommate: 'Ev/Oda Arkadaşı',
    carpooling: 'Yol Arkadaşı',
    course: 'Özel Ders',
    job: 'İş / Staj',
    scholarship: 'Burs'
};

export default function ProfilePage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'adverts' | 'favorites' | 'saved' | 'settings'>('adverts');
    const [userData, setUserData] = useState<any>(null);
    const [myAdverts, setMyAdverts] = useState<Advert[]>([]);
    const [myFavorites, setMyFavorites] = useState<any[]>([]);

    const [pageLoading, setPageLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<any>(null);

    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');

    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [savedCollections, setSavedCollections] = useState<Record<string, any[]>>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // pull the users info
    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                setPageLoading(true);
                // 1. DÜZELTME: KULLANICI BİLGİLERİ İÇİN API_URL ENTEGRE EDİLDİ
                const userRes = await fetch(`${API_URL}/api/auth/me`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userDataJson = await userRes.json();
                if (!userRes.ok) throw new Error(userDataJson.message);

                const currentProfile = userDataJson.user || userDataJson;

                if (currentProfile.birthdate) {
                    currentProfile.birthdate = new Date(currentProfile.birthdate).toISOString().split('T')[0];
                }
                setUserData(currentProfile);

                // pull the listings
                const listingsRes = await fetch(`${API_URL}/api/listing/my-listings`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const listingsData = await listingsRes.json();

                if (listingsRes.ok) {
                    setMyAdverts(listingsData.listings || []);
                }

            } catch (err: any) {
                console.error(err);
                setToastMessage("Veriler yüklenirken bir sorun oluştu.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchInitialData();
    }, [router, API_URL]);

    // get favorites
    useEffect(() => {
        if (activeTab === 'favorites' && userData) {
            const fetchFavorites = async () => {
                const token = localStorage.getItem('accessToken');
                try {
                    setTabLoading(true);
                    // 3. DÜZELTME: FAVORİLERİ ÇEKERKEN API_URL ENTEGRE EDİLDİ
                    const res = await fetch(`${API_URL}/api/user/me/favorites`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    setMyFavorites(data.listings || data || []);
                } catch (err) {
                    console.error("Favoriler çekilemedi:", err);
                } finally {
                    setTabLoading(false);
                }
            };
            fetchFavorites();
        }
    }, [activeTab, userData, API_URL]);

    // get saved collections
    useEffect(() => {
        if (activeTab === 'saved' && userData) {
            const fetchSavedCollections = async () => {
                const token = localStorage.getItem('accessToken');
                try {
                    setTabLoading(true);
                    const res = await fetch(`${API_URL}/api/user/me/saved`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (res.ok) setSavedCollections(data.saved_listings || {});
                } catch (err) {
                    console.error("Koleksiyonlar çekilemedi:", err);
                } finally {
                    setTabLoading(false);
                }
            };
            fetchSavedCollections();
        }
    }, [activeTab, userData, API_URL]);

    const handleRemoveFromSaved = async (listingId: string, listName: string) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_URL}/api/user/me/saved`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId, listName })
            });
            const data = await res.json();
            if (res.ok) {
                setSavedCollections(data.saved_listings || {});
                setToastMessage(`İlan '${listName}' koleksiyonundan çıkarıldı.`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // delete
    const confirmDelete = (id: string) => { setItemToDelete(id); setDeleteModalOpen(true); };
    const executeDelete = async () => {
        if (!itemToDelete) return;
        const token = localStorage.getItem('accessToken');
        try {
            // 4. DÜZELTME: İLAN SİLERKEN API_URL ENTEGRE EDİLDİ
            const response = await fetch(`${API_URL}/api/listing/${itemToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setMyAdverts(prev => prev.filter(ad => ad._id !== itemToDelete));
                setToastMessage('İlan veritabanından kalıcı olarak silindi.');
            } else {
                setToastMessage('İlan silinemedi.');
            }
        } catch (e) {
            setToastMessage('Bağlantı hatası oluştu.');
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    // update
    const openEditModal = (advert: any) => { setItemToEdit({ ...advert }); setEditModalOpen(true); };
    const saveEdit = async () => {
        if (!itemToEdit) return;
        const token = localStorage.getItem('accessToken');
        try {
            // 5. DÜZELTME: İLAN DÜZENLERKEN API_URL ENTEGRE EDİLDİ
            const response = await fetch(`${API_URL}/api/listing/${itemToEdit._id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: itemToEdit.title,
                    description: itemToEdit.description,
                    price: Number(itemToEdit.price)
                })
            });

            if (response.ok) {
                setMyAdverts(prev => prev.map(ad => ad._id === itemToEdit._id ? { ...ad, title: itemToEdit.title, description: itemToEdit.description, price: itemToEdit.price } : ad));
                setToastMessage('İlan güncellendi.');
            } else {
                setToastMessage('Güncelleme başarısız oldu.');
            }
        } catch (e) {
            setToastMessage('Bağlantı hatası.');
        } finally {
            setEditModalOpen(false);
            setItemToEdit(null);
        }
    };

    // republish listing
    const handleRepublish = async (id: string) => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch(`${API_URL}/api/listing/${id}/republish`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                setToastMessage(data.message || 'İlan başarıyla yeniden yayınlandı.');
                setMyAdverts(prev => prev.map(ad =>
                    ad._id === id ? { ...ad, status: 'active', is_deleted: false } : ad
                ));
            } else {
                setToastMessage(data.error || 'Yeniden yayınlama başarısız oldu.');
            }
        } catch (e) {
            setToastMessage('Bağlantı hatası oluştu.');
        }
    };

    // profile update
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('accessToken');

        try {
            const payload: any = {
                name: userData.name,
                surname: userData.surname,
                username: userData.username,
                email: userData.email,
                telephone: userData.telephone,
                birthdate: userData.birthdate ? new Date(userData.birthdate).toISOString() : null,
                university: userData.university
            };

            const response = await fetch(`${API_URL}/api/user/me`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setToastMessage('Profil verileriniz başarıyla güncellendi.');
                setNewPassword('');
            } else {
                const errData = await response.json();
                setToastMessage(errData.message || 'Güncelleme başarısız.');
            }
        } catch (err) {
            setToastMessage('Sunucuyla iletişim kurulamadı.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // profile photo update
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('profile_photo', file);

        setIsUploadingPhoto(true);
        try {
            const response = await fetch(`${API_URL}/api/user/me/profile-photo`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                setUserData({ ...userData, profile_photo: data.profile_photo });
                setToastMessage(data.message || 'Profil fotoğrafınız güncellendi.');
            } else {
                setToastMessage(data.error || 'Fotoğraf yüklenemedi.');
            }
        } catch (err) {
            setToastMessage('Bağlantı hatası.');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // password update
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword) return;

        const token = localStorage.getItem('accessToken');
        setIsChangingPassword(true);
        try {
            const response = await fetch(`${API_URL}/api/user/me/change-password`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await response.json();

            if (response.ok) {
                setToastMessage(data.message || 'Şifreniz güncellendi.');
                setOldPassword('');
                setNewPassword('');
            } else {
                setToastMessage(data.error || 'Şifre güncellenemedi.');
            }
        } catch (err) {
            setToastMessage('Bağlantı hatası.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleRemoveFavorite = async (listingId: string) => {
        const token = localStorage.getItem('accessToken');
        try {
            // 7. DÜZELTME: FAVORİLERDEN KALDIRIRKEN API_URL ENTEGRE EDİLDİ
            const res = await fetch(`${API_URL}/api/user/me/favorites/${listingId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMyFavorites(prev => prev.filter(fav => fav._id !== listingId));
                setToastMessage('Favorilerden kaldırıldı.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                <p className="text-cyan-400 font-bold uppercase tracking-widest animate-pulse">Profil Verileri Yükleniyor...</p>
            </div>
        );
    }

    if (!userData) return null;

    const userRating = userData.rating_count > 0 ? (userData.rating_sum / userData.rating_count).toFixed(1) : "0.0";
    const joinYear = userData.createdAt ? new Date(userData.createdAt).getFullYear() : 2026;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col relative text-gray-100">

            {/* toast notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 bg-cyan-900/90 border border-cyan-500/50 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <CheckCircle className="text-cyan-400" size={20} />
                    <span className="font-semibold text-white">{toastMessage}</span>
                </div>
            )}

            {/* delete modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0B0F19] border border-rose-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-center mb-4"><div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20"><AlertTriangle size={32} className="text-rose-500" /></div></div>
                        <h3 className="text-xl font-bold text-white text-center mb-2">İlanı Sil</h3>
                        <p className="text-gray-400 text-center text-sm mb-6">Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white font-medium">İptal</button>
                            <button onClick={executeDelete} className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 transition-colors text-white font-bold shadow-[0_0_15px_rgba(225,29,72,0.4)]">Evet, Sil</button>
                        </div>
                    </div>
                </div>
            )}

            {/* edit modal */}
            {editModalOpen && itemToEdit && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0B0F19] border border-cyan-500/30 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                            <h3 className="text-lg font-bold text-white">İlanı Düzenle</h3>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-cyan-400 mb-1.5 uppercase">İlan Başlığı</label>
                                <input type="text" value={itemToEdit.title} onChange={(e) => setItemToEdit({...itemToEdit, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-cyan-400 mb-1.5 uppercase">Açıklama</label>
                                <input type="text" value={itemToEdit.description} onChange={(e) => setItemToEdit({...itemToEdit, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-cyan-400 mb-1.5 uppercase">Fiyat (₺)</label>
                                <input type="number" value={itemToEdit.price} onChange={(e) => setItemToEdit({...itemToEdit, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" />
                            </div>
                            <button onClick={saveEdit} className="w-full mt-4 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition-colors text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]">Değişiklikleri Kaydet</button>
                        </div>
                    </div>
                </div>
            )}

            {/* top section: profile card */}
            <div className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">
                <div className="h-32 md:h-48 w-full bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-rose-900/40 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                </div>

                <div className="px-6 pb-6 md:px-10 md:pb-10 relative">
                    <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20 relative z-10">
                        <div className="w-32 h-32 rounded-full border-4 border-[#0B0F19] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] overflow-hidden relative group">
                            {userData.profile_photo ? (
                                <img src={userData.profile_photo} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-white">{userData.name?.charAt(0)}{userData.surname?.charAt(0)}</span>
                            )}

                            {/* HOVER EFEKTİ VE DOSYA SEÇİCİ */}
                            <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 backdrop-blur-sm">
                                {isUploadingPhoto ? (
                                    <Loader2 className="animate-spin text-cyan-400" size={28} />
                                ) : (
                                    <>
                                        <Camera className="text-white mb-1" size={24} />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Değiştir</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handlePhotoChange} disabled={isUploadingPhoto} />
                            </label>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black tracking-tight text-white">{userData.name} {userData.surname}</h1>
                                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg text-amber-400">
                                    <Star size={14} className="fill-current" />
                                    <span className="font-bold text-sm">{userRating}</span>
                                    <span className="text-xs opacity-50">({userData.rating_count || 0})</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
                                <span className="flex items-center gap-1.5 capitalize"><User size={16} className="text-cyan-400"/> {userData.account_type === 'student' ? 'Öğrenci' : 'Harici Kullanıcı'}</span>
                                {userData.account_type === 'student' && userData.university && (
                                    <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-blue-400"/> {userData.university}</span>
                                )}
                                <span className="flex items-center gap-1.5"><Calendar size={16} className="text-rose-400"/> Katılım: {joinYear}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveTab('settings')}
                            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-semibold flex items-center justify-center gap-2">
                            <Settings size={18} /> Profili Düzenle
                        </button>
                    </div>
                </div>
            </div>

            {/* bottom section */}
            <div className="flex flex-col md:flex-row gap-8">

                <div className="w-full md:w-72 flex flex-col gap-2">
                    <button onClick={() => setActiveTab('adverts')} className={`p-4 rounded-2xl flex items-center gap-3 font-semibold transition-all ${activeTab === 'adverts' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <Package size={20} /> İlanlarım ({myAdverts.length})
                    </button>
                    <button onClick={() => setActiveTab('favorites')} className={`p-4 rounded-2xl flex items-center gap-3 font-semibold transition-all ${activeTab === 'favorites' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <Heart size={20} /> Favorilerim
                    </button>

                    <button onClick={() => setActiveTab('saved')} className={`p-4 rounded-2xl flex items-center gap-3 font-semibold transition-all ${activeTab === 'saved' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <Bookmark size={20} /> Koleksiyonlarım
                    </button>

                    <button
                        onClick={() => router.push('/my-applications')}
                        className="p-4 rounded-2xl flex items-center gap-3 font-semibold transition-all bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    >
                        <Briefcase size={20} /> Başvurularım
                    </button>

                    <button onClick={() => setActiveTab('settings')} className={`p-4 rounded-2xl flex items-center gap-3 font-semibold transition-all ${activeTab === 'settings' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <Settings size={20} /> Hesap Ayarları
                    </button>
                </div>

                <div className="flex-1 bg-[#0B0F19]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 min-h-[400px]">

                    {activeTab === 'adverts' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-4">Aktif İlanlarım</h2>
                            {myAdverts.length === 0 ? (
                                <p className="text-sm text-gray-500">Henüz yayınlanmış bir ilanınız bulunmuyor.</p>
                            ) : (
                                myAdverts.map((advert) => (
                                    <div key={advert._id} className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">

                                        {/* TIKLANABİLİR ALAN: Fotoğraf ve Başlık Yan Yana */}
                                        <div
                                            className="flex items-center gap-4 cursor-pointer flex-1"
                                            onClick={() => router.push(`/listings/${advert._id}`)}
                                        >
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#0B0F19] border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {advert.photos && advert.photos.length > 0 ? (
                                                    <img src={advert.photos[0]} alt={advert.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <Package size={24} className="text-gray-600" />
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-lg text-gray-100 group-hover:text-cyan-400 transition-colors line-clamp-1">{advert.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[10px] sm:text-xs font-medium text-gray-500">
                                                    <span className="bg-white/5 px-2 py-1 rounded-md uppercase text-cyan-400">
                                                        {TYPE_MAP[advert.type || ''] || advert.category || 'Genel'}
                                                    </span>

                                                    {/* DOĞRUDAN STATUS BİLGİSİNE GÖRE ETİKET */}
                                                    {advert.is_deleted ? (
                                                        <span className="bg-rose-500/20 px-2 py-1 rounded-md uppercase text-rose-400 font-bold">Silindi</span>
                                                    ) : advert.status === 'expired' ? (
                                                        <span className="bg-amber-500/20 px-2 py-1 rounded-md uppercase text-amber-400 font-bold">Süresi Doldu</span>
                                                    ) : advert.status === 'sold' ? (
                                                        <span className="bg-blue-500/20 px-2 py-1 rounded-md uppercase text-blue-400 font-bold">Satıldı</span>
                                                    ) : (
                                                        <span className="bg-emerald-500/20 px-2 py-1 rounded-md uppercase text-emerald-400 font-bold">Aktif</span>
                                                    )}

                                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(advert.createdAt).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/10 md:border-0 shrink-0">
                                            <span className="text-xl font-black text-emerald-400">₺{advert.price}</span>
                                            <div className="flex items-center gap-2">

                                                {/* YENİ: SADECE İŞ VE BURS İLANLARINDA GÖZÜKEN BAŞVURULAR BUTONU */}
                                                {(advert.type === 'job' || advert.type === 'scholarship') && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); router.push(`/listings/${advert._id}/applications`); }}
                                                        title="Gelen Başvurular"
                                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-white font-bold transition-all shadow-[0_0_10px_rgba(124,58,237,0.1)]"
                                                    >
                                                        <FileText size={18} /> <span className="hidden sm:inline">Başvurular</span>
                                                    </button>
                                                )}

                                                {(advert.status === 'expired' && !advert.is_deleted) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRepublish(advert._id); }}
                                                        title="Yeniden Yayınla"
                                                        className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                )}

                                                <button onClick={(e) => { e.stopPropagation(); openEditModal(advert); }} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={18} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); confirmDelete(advert._id); }} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); router.push(`/listings/${advert._id}`); }} className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all hidden sm:block"><ExternalLink size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-4">Favoriye Aldıklarım</h2>
                            {tabLoading ? (
                                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-cyan-500 animate-spin" /></div>
                            ) : myFavorites.length === 0 ? (
                                <p className="text-sm text-gray-500">Favorilerinize eklenmiş ilan bulunamadı.</p>
                            ) : (
                                myFavorites.map((fav) => (
                                    <div key={fav._id} className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-rose-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">

                                        {/* YENİ EKLENEN KISIM: Fotoğraf ve Başlık Yan Yana */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#0B0F19] border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {fav.photos && fav.photos.length > 0 ? (
                                                    <img src={fav.photos[0]} alt={fav.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <Package size={24} className="text-gray-600" />
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-lg text-gray-100 group-hover:text-rose-400 transition-colors line-clamp-1">{fav.title}</h3>
                                                <p className="text-[11px] sm:text-xs text-gray-400 mt-1.5 font-medium">
                                                    Satıcı: <span className="text-cyan-400">@{fav.owner?.username || 'Kullanıcı'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Fiyat ve Butonlar (Aynı Kaldı) */}
                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/10 md:border-0">
                                            <span className="text-xl font-black text-emerald-400">₺{fav.price}</span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => router.push(`/listings/${fav._id}`)} className="px-4 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 font-semibold hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2">İlana Git <ExternalLink size={16} /></button>
                                                <button onClick={() => handleRemoveFavorite(fav._id)} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Heart size={18} className="fill-current" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2"><FolderOpen className="text-indigo-400"/> Koleksiyonlarım</h2>

                            {tabLoading ? (
                                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
                            ) : Object.keys(savedCollections).length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8 bg-white/5 rounded-2xl border border-white/10">Henüz hiçbir ilan koleksiyonu oluşturmadınız.</p>
                            ) : (
                                Object.entries(savedCollections).map(([listName, items]) => (
                                    <div key={listName} className="bg-black/20 border border-white/10 rounded-3xl p-6">
                                        <h3 className="text-lg font-black text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                            <Folder size={20} /> {listName} <span className="text-xs font-medium text-gray-500 ml-2 bg-white/5 px-2 py-0.5 rounded-full">{items.length} İlan</span>
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {items.map((savedItem: any) => (
                                                <div key={savedItem._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 group hover:border-indigo-500/30 transition-all">
                                                    <div className="w-16 h-16 rounded-xl bg-[#0B0F19] overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => router.push(`/listings/${savedItem._id}`)}>
                                                        {savedItem.photos?.length > 0 ? (
                                                            <img src={savedItem.photos[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                        ) : (
                                                            <Package size={20} className="w-full h-full p-4 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                        <h4 className="text-sm font-bold text-gray-200 truncate cursor-pointer hover:text-indigo-400" onClick={() => router.push(`/listings/${savedItem._id}`)}>{savedItem.title}</h4>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-sm font-black text-emerald-400">{savedItem.price ? `₺${savedItem.price}` : 'Ücretsiz'}</span>
                                                            <button
                                                                onClick={() => handleRemoveFromSaved(savedItem._id, listName)}
                                                                title="Koleksiyondan Çıkar"
                                                                className="text-gray-500 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Settings size={24} className="text-blue-400" /> Hesap Ayarları
                                </h2>
                                <span className="text-xs bg-white/5 px-3 py-1.5 rounded-full text-gray-400">ID: {userData._id}</span>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                        <User size={16} /> Kişisel Bilgiler
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">İsim (Name)</label>
                                            <input type="text" value={userData.name || ''} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Soyisim (Surname)</label>
                                            <input type="text" value={userData.surname || ''} onChange={(e) => setUserData({...userData, surname: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Kullanıcı Adı (Username)</label>
                                            <input type="text" value={userData.username || ''} onChange={(e) => setUserData({...userData, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Doğum Tarihi (Birthdate)</label>
                                            <input type="date" value={userData.birthdate || ''} onChange={(e) => setUserData({...userData, birthdate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors [color-scheme:dark]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                        <Mail size={16} /> İletişim Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Kişisel Email</label>
                                            <input type="email" value={userData.email || ''} onChange={(e) => setUserData({...userData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Telefon Numarası</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-4 top-3.5 text-gray-500" />
                                                <input type="tel" value={userData.telephone || ''} onChange={(e) => setUserData({...userData, telephone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {userData.account_type === 'student' && (
                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                            <GraduationCap size={16} /> Öğrenci Bilgileri
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Edu Email</label>
                                                <input type="email" value={userData.edu_email || ''} disabled className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed" />

                                                <div className="pt-2">
                                                    {userData.is_verified ? (
                                                        <div className="w-fit text-sm font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2">
                                                            <CheckCircle size={18} /> Doğrulandı
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => router.push('/verify-edu')}
                                                            className="relative w-full text-sm font-bold bg-purple-600 hover:bg-purple-500 border border-purple-500 text-white px-4 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] active:translate-y-0 overflow-hidden group flex justify-center items-center gap-2"
                                                        >
                                                            <span className="absolute w-0 h-0 transition-all duration-560 ease-out bg-white rounded-full group-hover:w-100 group-hover:h-100 opacity-10"></span>
                                                            <span className="relative z-10 flex items-center gap-2">Hemen Doğrula</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Üniversite</label>
                                                <input type="text" value={userData.university || ''} onChange={(e) => setUserData({...userData, university: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-white/10 flex justify-end">
                                    <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition-all text-black font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50">
                                        {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </form>
                            {userData.auth_provider === 'local' && (
                                <form onSubmit={handlePasswordChange} className="space-y-4 pt-8 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                        <Shield size={16} /> Güvenlik (Şifre Değiştirme)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Eğer kullanıcının zaten bir şifresi varsa eski şifreyi sor (hasExistingPassword mantığı) */}
                                        {userData.password !== false && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Mevcut Şifreniz</label>
                                                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500/50 transition-colors" />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Yeni Şifre</label>
                                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500/50 transition-colors" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button type="submit" disabled={isChangingPassword || !newPassword} className="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-bold disabled:opacity-50 border border-rose-500/20">
                                            {isChangingPassword ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}