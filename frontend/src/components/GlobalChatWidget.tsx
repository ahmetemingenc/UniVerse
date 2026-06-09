"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Bell } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function GlobalChatWidget() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showToast, setShowToast] = useState<{sender: string, text: string} | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const socketRef = useRef<Socket | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://universe-1-vdkr.onrender.com';

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        // Kullanıcı giriş yapmamışsa socket bağlama
        if (!token) return;

        // Socket Bağlantısını Başlat
        const socket = io(API_URL, {
            withCredentials: true,
            auth: { token: `Bearer ${token}` }
        });
        socketRef.current = socket;

        // Yeni mesajı dinle
        socket.on('new_message', (msg) => {
            // Eğer zaten mesajlar sayfasındaysak (okuyorsa) bildirim verme
            if (window.location.pathname !== '/messages') {
                setUnreadCount(prev => prev + 1);

                // Gelen mesaj için toast (bildirim) göster
                const senderName = msg.sender?.username || 'Yeni Mesaj';
                setShowToast({ sender: senderName, text: msg.text || 'Sana bir ek/konum gönderdi.' });

                // Bildirimi 5 saniye sonra gizle
                setTimeout(() => setShowToast(null), 5000);
            }
        });

        // Bileşen yok olduğunda (çıkış vs.) bağlantıyı temizle
        return () => {
            socket.disconnect();
        };
    }, [API_URL]);

    // Mesajlar sayfasına girildiğinde okundu sayısını sıfırla
    useEffect(() => {
        if (pathname === '/messages') {
            setUnreadCount(0);
        }
    }, [pathname]);

    // Giriş/Kayıt veya Admin sayfalarında bu butonu gizlemek isteyebiliriz
    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9900] flex flex-col items-end gap-3 pointer-events-none">

            {/* Canlı Mesaj Bildirimi (Toast) */}
            {showToast && (
                <div
                    onClick={() => router.push('/messages')}
                    className="bg-[#0B0F19]/90 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl shadow-[0_10px_30px_rgba(34,211,238,0.2)] text-white w-64 animate-in slide-in-from-bottom-5 pointer-events-auto cursor-pointer hover:bg-[#0B0F19] hover:border-cyan-500/50 transition-colors"
                >
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1 bg-cyan-500/20 rounded-full animate-pulse"><Bell size={12} className="text-cyan-400" /></div>
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-wider truncate">@{showToast.sender}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2 leading-tight">{showToast.text}</p>
                </div>
            )}

            {/* Sağ Alt Yüzen Mesaj Butonu */}
            {pathname !== '/messages' && (
                <button
                    onClick={() => router.push('/messages')}
                    className="w-14 h-14 bg-cyan-600 hover:bg-cyan-500 text-[#0B0F19] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:scale-110 pointer-events-auto relative group"
                >
                    <MessageCircle size={28} />

                    {/* Okunmamış Mesaj Sayacı */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0B0F19] animate-bounce">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}

                    {/* Hover Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 whitespace-nowrap shadow-xl">
                        Mesajlara Git
                    </div>
                </button>
            )}
        </div>
    );
}