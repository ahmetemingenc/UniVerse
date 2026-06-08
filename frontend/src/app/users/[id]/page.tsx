"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, User, Calendar, Star, GraduationCap, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';

interface Advert {
    _id: string;
    title: string;
    price: number | string;
    category: string;
    type: string;
    createdAt: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    // params.id artık satıcının id'si değil, referans aldığımız İLANIN id'si
    const listingId = params.id as string;

    const [userData, setUserData] = useState<any>(null);
    const [userListings, setUserListings] = useState<Advert[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://universe-1-vdkr.onrender.com';

    useEffect(() => {
        const fetchPublicProfile = async () => {
            if (!listingId) return;

            try {
                setPageLoading(true);
                setError(null);

                const token = localStorage.getItem('accessToken');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                // 1. İlan ID'si üzerinden ilanı çekip Sahibini (Owner) buluyoruz
                const listingRes = await fetch(`${API_URL}/api/listing/${listingId}`, {
                    method: 'GET',
                    headers
                });

                if (!listingRes.ok) {
                    throw new Error('Kullanıcı bilgisine ulaşmak için referans ilan bulunamadı.');
                }

                const listingDataJson = await listingRes.json();
                const listingDoc = listingDataJson.listing || listingDataJson.data || listingDataJson;
                const seller = listingDoc.owner || listingDoc.seller;

                if (!seller) {
                    throw new Error('İlanın sahibi bulunamadı.');
                }

                // Satıcıyı profile yansıtıyoruz
                setUserData(seller);

                // 2. Sahibin ID'sini (seller._id) kullanarak aktif tüm ilanlarını çekiyoruz
                const sellerId = seller._id || seller;
                const listingsRes = await fetch(`${API_URL}/api/listing/user/${sellerId}`, {
                    method: 'GET',
                    headers
                });

                if (listingsRes.ok) {
                    const listingsData = await listingsRes.json();
                    setUserListings(listingsData.listings || []);
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || "Kullanıcı verileri yüklenirken bir sorun oluştu.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchPublicProfile();
    }, [listingId, API_URL]);

    if (pageLoading) {
        return (
            <div className="min-h-screen pt-28 flex flex-col items-center justify-center relative">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                <p className="text-cyan-400 font-bold uppercase tracking-widest animate-pulse">Profil Yükleniyor...</p>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                    <User size={40} className="text-rose-500" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Kullanıcı Bulunamadı</h2>
                <p className="text-gray-400 mb-6 max-w-md">{error || 'Aradığınız profil mevcut değil veya kaldırılmış olabilir.'}</p>
                <button onClick={() => router.push('/feed')} className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors">
                    İlanlara Dön
                </button>
            </div>
        );
    }

    const userRating = userData.rating_count > 0 ? (userData.rating_sum / userData.rating_count).toFixed(1) : "0.0";
    const joinYear = userData.createdAt ? new Date(userData.createdAt).getFullYear() : "Gizli";

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col relative text-gray-100">

            {/* Top Section: Profile Card */}
            <div className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                {/* Banner */}
                <div className="h-32 md:h-48 w-full bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-indigo-900/40 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                </div>

                <div className="px-6 pb-6 md:px-10 md:pb-10 relative">
                    <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20 relative z-10">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-[#0B0F19] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] overflow-hidden flex-shrink-0">
                            {userData.profile_photo || userData.avatar ? (
                                <img src={userData.profile_photo || userData.avatar} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-white uppercase">
                                    {userData.name?.charAt(0) || userData.username?.charAt(0) || 'U'}
                                </span>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black tracking-tight text-white">
                                    {userData.name && userData.surname ? `${userData.name} ${userData.surname}` : userData.username}
                                </h1>
                                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg text-amber-400">
                                    <Star size={14} className="fill-current" />
                                    <span className="font-bold text-sm">{userRating}</span>
                                    <span className="text-xs opacity-50">({userData.rating_count || 0})</span>
                                </div>
                            </div>

                            <h2 className="text-sm font-bold text-cyan-400 mb-3">@{userData.username}</h2>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
                                {/* Dinamik Kullanıcı Rozetleri */}
                                {(userData.account_type?.toLowerCase() === 'student' || !!userData.edu_email) ? (
                                    (userData.is_verified || !!userData.edu_email) ? (
                                        <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            <ShieldCheck size={16}/> Onaylı Öğrenci
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-500/10 text-gray-300 border border-gray-500/20">
                                            <GraduationCap size={16}/> Öğrenci
                                        </span>
                                    )
                                ) : (
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-500/10 text-gray-300 border border-gray-500/20">
                                        <User size={16}/> Sivil Kullanıcı
                                    </span>
                                )}

                                {userData.university && (
                                    <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-blue-400"/> {userData.university}</span>
                                )}
                                <span className="flex items-center gap-1.5"><Calendar size={16} className="text-rose-400"/> Katılım: {joinYear}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: User's Listings */}
            <div className="bg-[#0B0F19]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                    <Package size={24} className="text-cyan-500" />
                    <h2 className="text-xl font-bold text-white">Yayındaki İlanları ({userListings.length})</h2>
                </div>

                {userListings.length === 0 ? (
                    <div className="text-center py-10">
                        <Package size={48} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400">Bu kullanıcının şu an yayında olan bir ilanı bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userListings.map((advert) => (
                            <div key={advert._id} onClick={() => router.push(`/listings/${advert._id}`)} className="group cursor-pointer bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-cyan-500/50 hover:bg-white/10 transition-all flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                                            {advert.category || advert.type || 'İlan'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-100 group-hover:text-cyan-300 transition-colors line-clamp-2 mb-3">
                                        {advert.title}
                                    </h3>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-xl font-black text-emerald-400">
                                        {advert.price ? `₺${Number(advert.price).toLocaleString('tr-TR')}` : 'Ücretsiz'}
                                    </span>
                                    <button className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors flex items-center gap-1">
                                        İncele <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}