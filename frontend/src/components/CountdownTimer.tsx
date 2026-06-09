"use client";

import { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
    expiresAt?: string;
    onComplete?: () => void; // Süre bittiğinde tetiklenecek fonksiyon
}

export default function CountdownTimer({ expiresAt, onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isFinished, setIsFinished] = useState(false);

    // Parent'tan gelen onComplete fonksiyonunu referans olarak tutuyoruz.
    // Bu sayede fonksiyon her render'da değişse bile useEffect'i yeniden tetiklemez.
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!expiresAt) {
            setTimeLeft("...");
            return;
        }

        let timer: NodeJS.Timeout;

        const updateTimer = () => {
            const difference = new Date(expiresAt).getTime() - new Date().getTime();

            // SÜRE DOLDUYSA
            if (difference <= 0) {
                setTimeLeft("SÜRE DOLDU");
                setIsFinished(true);

                if (onCompleteRef.current) {
                    onCompleteRef.current(); // Callback'i tetikle
                }

                clearInterval(timer); // Sayacı arka planda boşuna çalıştırma
                return;
            }

            // SAAT HESAPLAMA (% 24 kaldırdık ki 24 saat tam olarak 24:00:00 diye başlasın)
            const h = Math.floor(difference / (1000 * 60 * 60));
            const m = Math.floor((difference / 1000 / 60) % 60);
            const s = Math.floor((difference / 1000) % 60);

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        // Bileşen yüklendiğinde ilk hesaplamayı yap (1 saniye gecikmeyi önler)
        updateTimer();

        // Her saniye başı güncelle
        timer = setInterval(updateTimer, 1000);

        // Cleanup: Bileşen ekrandan silindiğinde sayacı durdur
        return () => clearInterval(timer);

        // Bağımlılık dizisinden isFinished ve onComplete'i sildik!
        // Artık sadece expiresAt değiştiğinde sayaç yeniden kurulacak.
    }, [expiresAt]);

    if (!timeLeft) return <span className="w-16 h-6 inline-block animate-pulse bg-white/5 rounded-md"></span>;

    return (
        <span className={`font-mono font-black tracking-widest px-2 py-1 rounded-md border text-xs ${
            isFinished
                ? 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                : 'text-rose-400 bg-rose-950/50 border-rose-500/30'
        }`}>
            {timeLeft}
        </span>
    );
}