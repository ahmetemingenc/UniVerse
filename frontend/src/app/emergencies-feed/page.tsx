"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, MapPin, Clock, ArrowRight, Eye } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

interface Emergency {
    _id: string;
    title: string;
    description: string;
    location: string;
    createdAt: string;
    expires?: string;
    expiresAt?: string;
    views?: number;
    type: string;
}

export default function EmergenciesPage() {
    const router = useRouter();
    const [emergencies, setEmergencies] = useState<Emergency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const fetchEmergencies = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await fetch(`${API_URL}/api/listing`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Hata oluştu.');

                // Veriyi filtrele ve CountdownTimer için hesapla
                const urgentListings = (data.listings || [])
                    .filter((ad: any) => ad.type === 'urgent')
                    .map((ad: any) => {
                        const createdAt = new Date(ad.createdAt);
                        const expiresHours = parseInt(ad.expires || '0', 10);
                        // Bitiş tarihi: Oluşturulma tarihi + expires süresi
                        const expiresAt = new Date(createdAt.getTime() + (expiresHours * 60 * 60 * 1000));

                        return { ...ad, expiresAt: expiresAt.toISOString() };
                    });

                setEmergencies(urgentListings);
            } catch (err: any) {
                setError(err.message);
                setEmergencies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmergencies();
    }, [router, API_URL]);


    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    return (
        <div className="relative min-h-screen pt-24 pb-12 px-4 md:px-8">
            {/* Background Animation */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slow-breathe { 0%, 100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 0.6; transform: scale(1.0); } }
                .animate-slow-breathe { animation: slow-breathe 4s infinite ease-in-out; }
            `}}/>
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
                <div className="w-[120rem] h-[120rem] bg-rose-600/20 rounded-full blur-[500px] mix-blend-screen animate-slow-breathe flex-shrink-0"></div>
            </div>

            <div className="max-w-7xl mx-auto z-10 relative">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-rose-500/20 pb-6">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-600 border-2 border-black"></span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-rose-400 tracking-tight">
                                Acil Durum Panosu
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm md:text-base">
                            Kampüsteki anlık yardımlaşma ağı.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/create-emergency')}
                        className="flex items-center justify-center space-x-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-rose-300 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    >
                        <span>Yeni Acil İlan Ver</span>
                        <ArrowRight size={18} />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!isLoading && emergencies.map((emergency) => (
                        <div
                            key={emergency._id}
                            onClick={() => router.push(`/listings/${emergency._id}`)}
                            className="group cursor-pointer bg-black/40 backdrop-blur-xl border border-rose-500/20 hover:border-rose-500/50 rounded-2xl p-6 transition-all hover:-translate-y-1 flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-[50px]"></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                                    <AlertTriangle size={14} className="text-rose-400" />
                                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">ACİL</span>
                                </div>
                                {emergency.expiresAt ? (
                                    <CountdownTimer
                                        expiresAt={emergency.expiresAt}
                                        onComplete={() => setEmergencies(prev => prev.filter(e => e._id !== emergency._id))}
                                    />
                                ) : (
                                    <div className="flex items-center space-x-1 text-gray-500 text-xs">
                                        <Eye size={14} />
                                        <span>{emergency.views || 0}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 relative z-10 flex-1">
                                <h2 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-rose-300 transition-colors">
                                    {emergency.title}
                                </h2>
                                <p className="text-sm text-gray-400 line-clamp-3">{emergency.description}</p>
                            </div>

                            <div className="pt-4 border-t border-rose-500/10 flex justify-between items-center relative z-10">
                                <div className="flex items-center text-gray-400 text-xs">
                                    <MapPin size={14} className="mr-1.5 text-rose-400" />
                                    <span className="truncate max-w-[120px]">{emergency.location || 'Konum Belirtilmemiş'}</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-xs">
                                    <Clock size={14} className="mr-1.5" />
                                    <span>{emergency.createdAt ? formatDate(emergency.createdAt) : 'Tarih Yok'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}