"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    expiresAt?: string;
    onComplete?: () => void; // Süre bittiğinde tetiklenecek fonksiyon
}

export default function CountdownTimer({ expiresAt, onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!expiresAt) {
            setTimeLeft("...");
            return;
        }

        const calculateTimeLeft = () => {
            const difference = new Date(expiresAt).getTime() - new Date().getTime();

            if (difference <= 0) {
                if (!isFinished) {
                    setIsFinished(true);
                    if (onComplete) onComplete();
                }
                return "SÜRE DOLDU";
            }

            const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const m = Math.floor((difference / 1000 / 60) % 60);
            const s = Math.floor((difference / 1000) % 60);

            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt, isFinished, onComplete]);

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