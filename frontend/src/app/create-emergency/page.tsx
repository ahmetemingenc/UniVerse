"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Clock, AlertCircle, ArrowRight, Text, MapPin, Loader2 } from 'lucide-react';

const durations = [
    { id: '1h', label: '1 Saat', value: 1, desc: 'Çok Acil' },
    { id: '3h', label: '3 Saat', value: 3, desc: 'Kısa Süreli' },
    { id: '12h', label: '12 Saat', value: 12, desc: 'Gün İçi' },
    { id: '24h', label: '24 Saat', value: 24, desc: 'Yarına Kadar' },
];

export default function CreateEmergencyPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDuration, setSelectedDuration] = useState(1); // Sayısal değer
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const token = localStorage.getItem('accessToken');

            // Backend'in createListingSchema'sına uygun payload
            const payload = {
                type: 'urgent',
                title,
                location,
                description,
                expires: selectedDuration, // Zod validator'da 1, 6, 12, 24 bekliyoruz
                price: 0
            };

            const response = await fetch(`${API_URL}/api/listing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'İlan oluşturulamadı');
            }

            setSubmitStatus('success');
            setTimeout(() => router.push('/feed'), 2000);

        } catch (error) {
            console.error("Error submitting emergency:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = title.trim().length > 2 && location.trim().length > 2;

    return (
        <div className="relative min-h-[80vh] flex flex-col justify-center py-10 px-4">
            {/* ... tasarım kodların aynı kalmalı ... */}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* İhtiyacın Nedir? */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-rose-400 ml-1 flex items-center space-x-2">
                        <AlertCircle size={16}/>
                        <span>İhtiyacın Nedir? <span className="text-rose-600">*</span></span>
                    </label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Kütüphanede Type-C şarj aleti lazım!"
                        className="w-full bg-rose-950/20 border border-rose-500/20 rounded-xl py-4 px-5 focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/50 outline-none text-gray-100 text-lg font-medium placeholder:text-rose-900/50 transition-all"
                    />
                </div>

                {/* Konum */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-rose-400 ml-1 flex items-center space-x-2">
                        <MapPin size={16}/>
                        <span>Şu An Neredesin? <span className="text-rose-600">*</span></span>
                    </label>
                    <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Örn: Merkez Kütüphane, Zemin Kat"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-rose-500/40 outline-none text-gray-200 transition-all"
                    />
                </div>

                {/* Süre */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-rose-400 ml-1 flex items-center space-x-2">
                        <Clock size={16}/>
                        <span>İlan Süresi</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {durations.map((dur) => (
                            <button
                                key={dur.id}
                                type="button"
                                onClick={() => setSelectedDuration(dur.value)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                                    selectedDuration === dur.value
                                        ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-[1.02]'
                                        : 'bg-black/40 border-white/5 hover:border-rose-500/30'
                                }`}
                            >
                                <span className={`font-bold ${selectedDuration === dur.value ? 'text-rose-400' : 'text-gray-300'}`}>{dur.label}</span>
                                <span className={`text-[10px] uppercase tracking-wider mt-1 ${selectedDuration === dur.value ? 'text-rose-300/70' : 'text-gray-600'}`}>{dur.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Buton */}
                <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-4 mt-6 font-black rounded-xl transition-all flex items-center justify-center space-x-2 group ${
                        !isFormValid || isSubmitting
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-70'
                            : submitStatus === 'success'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer'}`}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> :
                        <span>{submitStatus === 'success' ? 'BAŞARIYLA YAYINLANDI!' : 'ACİL İLAN YAYINLA'}</span>}
                </button>
            </form>
        </div>
    );
}