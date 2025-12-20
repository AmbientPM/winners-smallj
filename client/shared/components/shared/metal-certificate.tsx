"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { CertificateData, METALS } from "@/shared/types/api";

export function MetalCertificate({
    metalType,
    serialNumber = "A00000000B",
    tokenAmount = 0,
    className
}: CertificateData & { className?: string }) {
    const [mounted, setMounted] = useState(false);
    const metalConfig = METALS[metalType];

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isGold = metalType === 'gold';
    const bgGradient = isGold
        ? 'from-amber-100 via-yellow-200 to-amber-100'
        : 'from-slate-100 via-slate-200 to-zinc-100';
    const borderColor = isGold ? 'border-amber-700/40' : 'border-slate-700/40';
    const textColor = isGold ? 'text-amber-900' : 'text-slate-900';
    const badgeBg = isGold ? 'bg-amber-700/10' : 'bg-slate-700/10';
    const badgeBorder = isGold ? 'border-amber-700/40' : 'border-slate-700/40';
    const borderAccent = isGold ? 'border-amber-700/40' : 'border-slate-700/40';
    const strokeColor = isGold ? '#78350f' : '#334155';

    return (
        <div className={cn("relative aspect-[1.6/1] max-w-md mx-auto", className)}>
            {/* Certificate Container - Card Format */}
            <div className={cn("relative w-full h-full overflow-hidden rounded-xl border-2 shadow-2xl bg-gradient-to-br", borderColor, bgGradient)}>
                {/* Background Image - Base Layer */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyScTHJRDQjNidJzXE8Qem7r6XWSWrfojZPw&s")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: isGold ? 'sepia(0.8) saturate(1.5) hue-rotate(15deg) brightness(1.1)' : 'sepia(0.3) brightness(1.1)',
                    }}
                />
                {/* Paper Texture Overlay */}
                <div
                    className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none z-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Engraving Texture Overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id={`engraving-bg-${metalType}`} x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="2" y2="2" stroke={strokeColor} strokeWidth="0.3" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#engraving-bg-${metalType})`} />
                </svg>

                {/* Guilloche Pattern Border */}
                <div className="absolute inset-0 pointer-events-none opacity-60">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id={`guilloche-${metalType}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path
                                    d="M0,15 Q7.5,7.5 15,15 T30,15"
                                    stroke={strokeColor}
                                    strokeWidth="0.4"
                                    fill="none"
                                    opacity="0.12"
                                />
                                <path
                                    d="M15,0 Q22.5,7.5 15,15 T15,30"
                                    stroke={strokeColor}
                                    strokeWidth="0.4"
                                    fill="none"
                                    opacity="0.12"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#guilloche-${metalType})`} />
                    </svg>
                </div>

                {/* Main Content - Horizontal Card Layout */}
                <div className="relative h-full flex flex-col p-4">
                    {/* Header - Compact */}
                    <div className={cn("flex items-center justify-between border-b pb-2 mb-3", borderAccent)}>
                        <Badge variant="outline" className={cn(badgeBg, textColor, badgeBorder, "text-[9px]")} style={{ fontFamily: 'var(--font-courier)' }}>
                            {serialNumber}
                        </Badge>
                        <div className="text-center flex-1">
                            <svg width="100%" height="40" viewBox="0 0 250 40" className="overflow-visible">
                                <defs>
                                    <path id={`curve-${metalType}`} d="M 30,35 Q 125,8 220,35" fill="transparent" />
                                </defs>
                                <text
                                    className="font-bold tracking-[0.2em]"
                                    style={{
                                        fontFamily: 'var(--font-cinzel)',
                                        fontSize: '16px',
                                        fill: strokeColor,
                                        paintOrder: 'stroke fill',
                                        stroke: '#000',
                                        strokeWidth: '0.5px'
                                    }}
                                >
                                    <textPath href={`#curve-${metalType}`} startOffset="50%" textAnchor="middle">
                                        UNITED STATES
                                    </textPath>
                                </text>
                            </svg>
                            <p className={cn("text-[9px] uppercase tracking-widest -mt-2", isGold ? 'text-amber-700/80' : 'text-slate-700/80')}>{metalConfig.name} Certificate</p>
                        </div>
                        <Badge variant="outline" className={cn(badgeBg, textColor, badgeBorder, "text-[9px]")} style={{ fontFamily: 'var(--font-courier)' }}>
                            2025
                        </Badge>
                    </div>

                    {/* Main Body - Horizontal Layout */}
                    <div className="flex gap-3 flex-1">
                        {/* Certificate Text - Compact */}
                        <div className="flex-1 flex flex-col justify-center py-2 space-y-4">
                            <div className="text-center">
                                <p className={cn("text-[10px] uppercase tracking-widest mb-2", isGold ? 'text-amber-700/90' : 'text-slate-700/90')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>This Certifies That</p>
                                <div className={cn("border-2 rounded-lg px-4 py-2.5 bg-white/60 inline-block shadow-sm", borderAccent)}>
                                    <p className={cn("text-3xl font-bold leading-none", textColor)} style={{ fontFamily: 'var(--font-cinzel)' }}>
                                        {tokenAmount.toFixed(2)}
                                    </p>
                                    <p className={cn("text-[11px] mt-1 tracking-wide", isGold ? 'text-amber-700/80' : 'text-slate-700/80')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>{metalConfig.symbol} OUNCES</p>
                                </div>
                            </div>

                            <div className="text-center px-2">
                                <p className={cn("text-[9px] leading-relaxed mb-1.5", isGold ? 'text-amber-700/75' : 'text-slate-700/75')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                    Are deposited in the Treasury of the
                                </p>
                                <p className={cn("text-[12px] font-bold uppercase tracking-widest mb-1.5", textColor)} style={{ fontFamily: 'var(--font-cinzel)' }}>
                                    {metalConfig.name} Ounce Reserve
                                </p>
                                <p className={cn("text-[9px] leading-relaxed", isGold ? 'text-amber-700/75' : 'text-slate-700/75')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                    Payable to the bearer on demand
                                </p>
                            </div>
                        </div>

                        {/* Portrait Section - Smaller */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className={cn("w-24 h-28 border-2 rounded overflow-hidden bg-gradient-to-br relative",
                                borderAccent,
                                isGold ? 'from-amber-200 to-amber-300' : 'from-slate-200 to-slate-300'
                            )}>
                                {/* Trump Portrait */}
                                <img
                                    src="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i0tuSai1hrs4/v0/640x-1.jpg"
                                    alt="Trump Portrait"
                                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
                                />
                                {/* Engraving effect overlay */}
                                <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id={`engraving-portrait-${metalType}`} x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
                                            <line x1="0" y1="0" x2="2" y2="2" stroke={strokeColor} strokeWidth="0.3" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill={`url(#engraving-portrait-${metalType})`} />
                                </svg>
                                {/* Portrait frame shadow */}
                                <div className="absolute inset-0 shadow-inner pointer-events-none" />
                            </div>

                            {/* Signature */}
                            <div className="w-24 text-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Donald_Trump_Signature.svg/1200px-Donald_Trump_Signature.svg.png"
                                    alt="Signature"
                                    className="h-5 w-auto mx-auto grayscale opacity-70"
                                />
                                <div className={cn("border-t mt-1", borderAccent)}>
                                    <p className={cn("text-[6px] uppercase tracking-wide mt-0.5 leading-tight", isGold ? 'text-amber-700/60' : 'text-slate-700/60')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                        Secretary
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="transform -rotate-12 opacity-5">
                        <p className={cn("text-4xl font-bold", textColor)} style={{ fontFamily: 'var(--font-cinzel)' }}>
                            CLAIM
                        </p>
                        <p className={cn("text-lg text-center -mt-1", textColor)} style={{ fontFamily: 'var(--font-cinzel)' }}>
                            COMING SOON
                        </p>
                    </div>
                </div>

                {/* Decorative Corners */}
                <div className={cn("absolute top-1.5 left-1.5 w-6 h-6 border-t-2 border-l-2 rounded-tl", borderAccent)} />
                <div className={cn("absolute top-1.5 right-1.5 w-6 h-6 border-t-2 border-r-2 rounded-tr", borderAccent)} />
                <div className={cn("absolute bottom-1.5 left-1.5 w-6 h-6 border-b-2 border-l-2 rounded-bl", borderAccent)} />
                <div className={cn("absolute bottom-1.5 right-1.5 w-6 h-6 border-b-2 border-r-2 rounded-br", borderAccent)} />
            </div>
        </div>
    );
}
