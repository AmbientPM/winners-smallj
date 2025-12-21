"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { PiCoinVerticalFill } from "react-icons/pi";

interface Coin {
    id: number;
    x: number;
    isGold: boolean;
    rotation: number;
    scale: number;
    duration: number;
    driftX: number;
    spinDirection: number;
    delay: number;
}

export function AnimatedIngotsBackground() {
    const [mounted, setMounted] = useState(false);
    const [coins, setCoins] = useState<Coin[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const idCounterRef = useRef(0);
    const coinsRef = useRef<Coin[]>([]);
    const maxCoins = 15;

    // Синхронизация ref с state
    useEffect(() => {
        coinsRef.current = coins;
    }, [coins]);

    const spawnCoin = useCallback(() => {
        if (coinsRef.current.length >= maxCoins) return;

        const isGold = Math.random() > 0.5;
        const spinDirection = Math.random() > 0.5 ? 1 : -1;

        const newCoin: Coin = {
            id: idCounterRef.current++,
            x: Math.random() * 100,
            isGold,
            rotation: Math.random() * 360,
            scale: 0.6 + Math.random() * 0.6,
            duration: 8 + Math.random() * 6,
            driftX: (Math.random() - 0.5) * 40,
            spinDirection,
            delay: Math.random() * 0.5,
        };

        setCoins(prev => {
            const updated = [...prev, newCoin];
            if (updated.length > maxCoins) {
                return updated.slice(1);
            }
            return updated;
        });

        // Удаление после завершения анимации
        setTimeout(() => {
            setCoins(prev => prev.filter(c => c.id !== newCoin.id));
        }, (newCoin.duration + newCoin.delay) * 1000 + 100);
    }, []);

    useEffect(() => {
        setMounted(true);

        // Начальный спавн
        for (let i = 0; i < 5; i++) {
            setTimeout(() => spawnCoin(), i * 400);
        }

        // Периодический спавн с фиксированным интервалом
        const interval = setInterval(() => {
            spawnCoin();
        }, 1500);

        return () => clearInterval(interval);
    }, [spawnCoin]);

    // Генерация CSS keyframes для всех монет
    const globalStyles = useMemo(() => {
        if (coins.length === 0) return '';

        return coins.map(coin => `
            @keyframes fall-${coin.id} {
                0% {
                    transform: translateY(0) translateX(0) rotate(${coin.rotation}deg) scale(${coin.scale});
                    opacity: 0;
                }
                10% {
                    opacity: ${coin.isGold ? 0.35 : 0.3};
                }
                90% {
                    opacity: ${coin.isGold ? 0.35 : 0.3};
                }
                100% {
                    transform: translateY(120vh) translateX(${coin.driftX}px) rotate(${coin.rotation + coin.spinDirection * 720}deg) scale(${coin.scale});
                    opacity: 0;
                }
            }
        `).join('\n');
    }, [coins]);

    if (!mounted) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-transparent"
        >
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

            {coins.map((coin) => (
                <div
                    key={coin.id}
                    className="absolute will-change-transform"
                    style={{
                        left: `${coin.x}%`,
                        top: '-50px',
                        animation: `fall-${coin.id} ${coin.duration}s linear ${coin.delay}s forwards`,
                    }}
                >
                    <PiCoinVerticalFill
                        size={40}
                        style={{
                            color: coin.isGold ? '#fbbf24' : '#94a3b8',
                            filter: coin.isGold
                                ? 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.5))'
                                : 'drop-shadow(0 2px 8px rgba(148, 163, 184, 0.5))',
                        }}
                    />
                </div>
            ))}
        </div>
    );
}