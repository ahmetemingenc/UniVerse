"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Radio, X } from 'lucide-react';

export default function SystemAnnouncement() {
    const [announcement, setAnnouncement] = useState<{ title: string; message: string; timestamp: string } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return; // Kullanıcı giriş yapmamışsa sokete bağlanmaya gerek yok

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://universe-1-vdkr.onrender.com';

        // Soket bağlantısını kur
        const socket: Socket = io(API_URL, {
            auth: { token: `Bearer ${token}` }
        });

        // "system_announcement" eventini dinle
        socket.on('system_announcement', (data: { title: string; message: string; timestamp: string }) => {
            setAnnouncement(data);

            // İsteğe bağlı: Uyarının 15 saniye sonra ekrandan otomatik kaybolmasını sağlar
            // setTimeout(() => setAnnouncement(null), 15000);
        });

        // Component ekrandan kalkarsa veya kullanıcı çıkış yaparsa bağlantıyı temizle
        return () => {
            socket.off('system_announcement');
            socket.disconnect();
        };
    }, []);

    if (!announcement) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-lg bg-gradient-to-r from-[#1b0a11] to-[#0B0F19] border-2 border-rose-500/50 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_50px_rgba(225,29,72,0.4)] animate-in slide-in-from-top-10 fade-in zoom-in-95 duration-500">
            <button
                onClick={() => setAnnouncement(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
                <X size={18} />
            </button>

            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Radio size={24} className="text-rose-500" />
                </div>
                <div className="pr-6">
                    <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        Sistem Duyurusu
                    </h3>
                    <h4 className="text-xl font-bold text-white mb-2 leading-tight">
                        {announcement.title}
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {announcement.message}
                    </p>
                    <div className="mt-3 text-[10px] text-gray-500 font-mono">
                        {new Date(announcement.timestamp).toLocaleTimeString('tr-TR')} itibarıyla iletildi
                    </div>
                </div>
            </div>
        </div>
    );
}