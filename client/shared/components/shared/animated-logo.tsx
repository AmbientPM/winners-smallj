"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function AnimatedLogo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stellarRef = useRef<HTMLDivElement>(null);
    const coinsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!containerRef.current || !stellarRef.current) return;

        const ctx = gsap.context(() => {
            // Stellar entrance animation - быстрое появление
            gsap.to(stellarRef.current, {
                scale: 1,
                rotation: 0,
                opacity: 0.7,
                duration: 0.6,
                ease: "back.out(1.7)",
                delay: 0.1,
            });

            // Stellar gentle rotation
            gsap.to(stellarRef.current, {
                rotation: 360,
                duration: 20,
                ease: "none",
                repeat: -1,
                delay: 0.7,
            });

            // Ingots entrance animation
            coinsRef.current.forEach((ingot, i) => {
                if (!ingot) return;

                // Gold ingot (left) - slide from left
                if (i === 0) {
                    gsap.to(ingot, {
                        x: 0,
                        rotation: 0,
                        opacity: 1,
                        duration: 0.5,
                        ease: "power3.out",
                        delay: 0,
                    });

                    // Gentle tilt animation
                    gsap.to(ingot, {
                        rotation: -3,
                        duration: 3,
                        ease: "sine.inOut",
                        repeat: -1,
                        yoyo: true,
                        delay: 0.5,
                    });

                    // Glow pulse for gold
                    gsap.to(ingot, {
                        filter: "drop-shadow(0 4px 16px rgba(251, 191, 36, 0.7))",
                        duration: 2,
                        ease: "sine.inOut",
                        repeat: -1,
                        yoyo: true,
                        delay: 0.5,
                    });
                }

                // Silver ingot (right) - slide from right
                if (i === 1) {
                    gsap.to(ingot, {
                        x: 0,
                        rotation: 0,
                        opacity: 1,
                        duration: 0.5,
                        ease: "power3.out",
                        delay: 0.1,
                    });

                    // Gentle tilt animation
                    gsap.to(ingot, {
                        rotation: 3,
                        duration: 3.2,
                        ease: "sine.inOut",
                        repeat: -1,
                        yoyo: true,
                        delay: 0.6,
                    });

                    // Glow pulse for silver
                    gsap.to(ingot, {
                        filter: "drop-shadow(0 4px 16px rgba(148, 163, 184, 0.7))",
                        duration: 2.2,
                        ease: "sine.inOut",
                        repeat: -1,
                        yoyo: true,
                        delay: 0.6,
                    });
                }
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-48 h-32 mx-auto mb-2"
            style={{ perspective: "1200px" }}
        >
            {/* Main ingots display */}
            <div className="absolute inset-0 flex items-center justify-center gap-4">
                {/* Gold ingot */}
                <div
                    ref={(el) => { coinsRef.current[0] = el; }}
                    className="relative"
                    style={{
                        width: "80px",
                        height: "80px",
                        transformStyle: "preserve-3d",
                        opacity: 0,
                        transform: "translateX(-100px) rotate(-15deg)",
                    }}
                >
                    <svg
                        viewBox="0 0 58.593 58.593"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            filter: "drop-shadow(0 6px 16px rgba(251, 191, 36, 0.6))",
                        }}
                    >
                        <defs>
                            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef3c7" />
                                <stop offset="20%" stopColor="#fde68a" />
                                <stop offset="40%" stopColor="#fcd34d" />
                                <stop offset="60%" stopColor="#fbbf24" />
                                <stop offset="80%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                            <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0" />
                                <stop offset="50%" stopColor="#fffbeb" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M58.452,19.188l-6.14-10.339c-0.003-0.005-0.009-0.008-0.012-0.013c-0.068-0.11-0.158-0.203-0.264-0.28
                            c-0.017-0.013-0.033-0.025-0.051-0.037c-0.018-0.012-0.033-0.027-0.053-0.038L41.224,2.629c-0.364-0.199-0.814-0.152-1.131,0.119
                            L5.83,32.163c-0.007,0.006-0.012,0.015-0.019,0.021c-0.013,0.012-0.023,0.026-0.035,0.039c-0.075,0.076-0.135,0.162-0.182,0.255
                            c-0.007,0.013-0.019,0.021-0.025,0.034L0.088,44.736c-0.217,0.482-0.021,1.049,0.447,1.294l18.931,9.94
                            c0.015,0.008,0.032,0.011,0.048,0.018c0.013,0.006,0.023,0.016,0.037,0.022c0.014,0.006,0.029,0.003,0.043,0.008
                            c0.11,0.039,0.222,0.066,0.337,0.066c0.007,0.001,0.015,0,0.02,0c0.101,0,0.194-0.03,0.286-0.058
                            c0.02-0.006,0.042-0.005,0.062-0.013c0.154-0.058,0.285-0.151,0.392-0.271l37.587-35.317C58.619,20.106,58.693,19.591,58.452,19.188
                            z M2.297,44.697l4.694-10.468l11.337,4.872l0.538,14.296L2.297,44.697z M20.848,52.852L20.321,38.86l16.546-14.962l14.352-12.978
                            l5.105,8.598L20.848,52.852z"
                            fill="url(#goldGradient)"
                            stroke="#b45309"
                            strokeWidth="0.5"
                        />
                        {/* Highlight shine */}
                        <ellipse
                            cx="32"
                            cy="18"
                            rx="12"
                            ry="6"
                            fill="url(#goldHighlight)"
                            opacity="0.6"
                        />
                    </svg>
                </div>

                {/* Silver ingot */}
                <div
                    ref={(el) => { coinsRef.current[1] = el; }}
                    className="relative"
                    style={{
                        width: "80px",
                        height: "80px",
                        transformStyle: "preserve-3d",
                        opacity: 0,
                        transform: "translateX(100px) rotate(15deg)",
                    }}
                >
                    <svg
                        viewBox="0 0 58.593 58.593"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            filter: "drop-shadow(0 6px 16px rgba(148, 163, 184, 0.6))",
                        }}
                    >
                        <defs>
                            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="20%" stopColor="#f8fafc" />
                                <stop offset="40%" stopColor="#e2e8f0" />
                                <stop offset="60%" stopColor="#cbd5e1" />
                                <stop offset="80%" stopColor="#94a3b8" />
                                <stop offset="100%" stopColor="#64748b" />
                            </linearGradient>
                            <linearGradient id="silverHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f8fafc" stopOpacity="0" />
                                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M58.452,19.188l-6.14-10.339c-0.003-0.005-0.009-0.008-0.012-0.013c-0.068-0.11-0.158-0.203-0.264-0.28
                            c-0.017-0.013-0.033-0.025-0.051-0.037c-0.018-0.012-0.033-0.027-0.053-0.038L41.224,2.629c-0.364-0.199-0.814-0.152-1.131,0.119
                            L5.83,32.163c-0.007,0.006-0.012,0.015-0.019,0.021c-0.013,0.012-0.023,0.026-0.035,0.039c-0.075,0.076-0.135,0.162-0.182,0.255
                            c-0.007,0.013-0.019,0.021-0.025,0.034L0.088,44.736c-0.217,0.482-0.021,1.049,0.447,1.294l18.931,9.94
                            c0.015,0.008,0.032,0.011,0.048,0.018c0.013,0.006,0.023,0.016,0.037,0.022c0.014,0.006,0.029,0.003,0.043,0.008
                            c0.11,0.039,0.222,0.066,0.337,0.066c0.007,0.001,0.015,0,0.02,0c0.101,0,0.194-0.03,0.286-0.058
                            c0.02-0.006,0.042-0.005,0.062-0.013c0.154-0.058,0.285-0.151,0.392-0.271l37.587-35.317C58.619,20.106,58.693,19.591,58.452,19.188
                            z M2.297,44.697l4.694-10.468l11.337,4.872l0.538,14.296L2.297,44.697z M20.848,52.852L20.321,38.86l16.546-14.962l14.352-12.978
                            l5.105,8.598L20.848,52.852z"
                            fill="url(#silverGradient)"
                            stroke="#475569"
                            strokeWidth="0.5"
                        />
                        {/* Highlight shine */}
                        <ellipse
                            cx="32"
                            cy="18"
                            rx="12"
                            ry="6"
                            fill="url(#silverHighlight)"
                            opacity="0.7"
                        />
                    </svg>
                </div>

                {/* Stellar icon - центр композиции */}
                <div
                    ref={stellarRef}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        opacity: 0,
                        transform: "translate(-50%, -50%) scale(0) rotate(-180deg)",
                        filter: "drop-shadow(0 0 16px rgba(255, 215, 0, 0.5)) drop-shadow(0 0 24px rgba(192, 192, 192, 0.4))",
                    }}
                >

                    <svg width="0" height="0">
                        <defs>
                            <linearGradient id="stellarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="50%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#cbd5e1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {/* Ambient glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(251, 191, 36, 0.12) 0%, rgba(148, 163, 184, 0.08) 50%, transparent 75%)",
                }}
            />
        </div>
    );
}
