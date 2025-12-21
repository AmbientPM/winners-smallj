"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { CertificateData, METALS } from "@/shared/types/api";

export function MetalCertificate({
    metalType,
    serialNumber = "A00000000B",
    tokenAmount = 0,
    uniqueNumber = '000000001',
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
        ? 'from-amber-50 via-yellow-100 to-amber-50'
        : 'from-slate-50 via-slate-100 to-zinc-50';
    const borderColor = isGold ? 'border-amber-700/40' : 'border-slate-700/40';
    const textColor = isGold ? 'text-amber-900' : 'text-slate-900';
    const badgeBg = isGold ? 'bg-amber-700/10' : 'bg-slate-700/10';
    const badgeBorder = isGold ? 'border-amber-700/40' : 'border-slate-700/40';
    const borderAccent = isGold ? 'border-amber-700/40' : 'border-slate-700/40';
    const strokeColor = isGold ? '#78350f' : '#334155';
    const sealColor = isGold ? 'text-amber-600' : 'text-slate-600';

    return (
        <div className={cn("relative aspect-[1.75/1] w-full mx-auto @container", className)}>
            {/* Certificate Container - Card Format */}
            <div className={cn("relative w-full h-full overflow-hidden rounded-[1cqw] border shadow-xl bg-gradient-to-br", borderColor, bgGradient)}>
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
                <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-multiply pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id={`engraving-lines-${metalType}`} x="0" y="0" width="1.5" height="1.5" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="1.5" y2="1.5" stroke={strokeColor} strokeWidth="0.2" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#engraving-lines-${metalType})`} />
                </svg>

                {/* Guilloche Pattern Border */}
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id={`guilloche-${metalType}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path
                                    d="M0,10 Q5,5 10,10 T20,10"
                                    stroke={strokeColor}
                                    strokeWidth="0.3"
                                    fill="none"
                                    opacity="0.3"
                                />
                                <path
                                    d="M10,0 Q15,5 10,10 T10,20"
                                    stroke={strokeColor}
                                    strokeWidth="0.3"
                                    fill="none"
                                    opacity="0.3"
                                />
                                <circle cx="10" cy="10" r="1" fill={strokeColor} opacity="0.2" />
                            </pattern>
                            <pattern id={`guilloche-border-${metalType}`} x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
                                <path d="M0,7.5 Q3.75,3.75 7.5,7.5 T15,7.5" stroke={strokeColor} strokeWidth="0.5" fill="none" opacity="0.4" />
                                <path d="M7.5,0 Q11.25,3.75 7.5,7.5 T7.5,15" stroke={strokeColor} strokeWidth="0.5" fill="none" opacity="0.4" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#guilloche-${metalType})`} />
                        <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" strokeWidth="12" stroke={`url(#guilloche-border-${metalType})`} fill="none" rx="10" />
                    </svg>
                </div>

                {/* Main Content */}
                <div className="relative h-full flex flex-col p-[2.5cqw] z-20">
                    {/* Header */}
                    <div className={cn("flex items-center justify-between border-b pb-[1cqw] mb-[1cqw]", borderAccent)}>
                        <div className="text-center">
                            <p className="text-[1.8cqw] uppercase tracking-wider" style={{ fontFamily: 'var(--font-eb-garamond)' }}>Series</p>
                            <p className="text-[2.2cqw] font-bold" style={{ fontFamily: 'var(--font-courier)' }}>2025</p>
                        </div>
                        <div className="text-center flex-1 px-[1cqw]">
                            <p className={cn("text-[4cqw] font-bold tracking-[0.05em]", textColor)} style={{ fontFamily: 'var(--font-cinzel)' }}>
                                {metalConfig.name} Certificate
                            </p>
                            <p className={cn("text-[1.6cqw] uppercase tracking-widest -mt-[0.3cqw]", isGold ? 'text-amber-700/80' : 'text-slate-700/80')}>
                                United States Treasury
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[1.8cqw] uppercase tracking-wider text-red-800" style={{ fontFamily: 'var(--font-eb-garamond)' }}>Voucher No.</p>
                            <p className="text-[2.2cqw] font-bold text-red-700" style={{ fontFamily: 'var(--font-courier)' }}>{uniqueNumber}</p>
                        </div>
                    </div>

                    {/* Main Body */}
                    <div className="flex-1 grid grid-cols-12 gap-[1.5cqw]">
                        {/* Left Section */}
                        <div className="col-span-3 flex flex-col items-center justify-between">
                            <div className={cn("w-[18cqw] h-[18cqw] border rounded-full overflow-hidden bg-white/50 relative shadow-inner", borderAccent)}>
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Great_Seal_of_the_United_States_%28obverse%29.svg/1200px-Great_Seal_of_the_United_States_%28obverse%29.svg.png"
                                    alt="Great Seal of the United States"
                                    className="absolute inset-0 w-full h-full object-contain p-[1cqw] opacity-80"
                                    style={{ filter: isGold ? 'sepia(0.5) saturate(1.2) hue-rotate(5deg)' : 'grayscale(1) contrast(1.1)' }}
                                />
                            </div>
                        </div>

                        {/* Center Section */}
                        <div className="col-span-6 flex flex-col justify-center items-center text-center">
                            <div className={cn("border-y my-[1cqw] py-[1.5cqw] px-[2.5cqw] bg-white/30", borderAccent)}>
                                <p className={cn("text-[6cqw] font-bold leading-none", textColor)} style={{ fontFamily: 'var(--font-cinzel)' }}>
                                    {tokenAmount.toFixed(2)}
                                </p>
                                <p className={cn("text-[2cqw] mt-[0.5cqw] tracking-wide uppercase", isGold ? 'text-amber-700/80' : 'text-slate-700/80')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                    Fine {metalConfig.name} {metalConfig.symbol} Ounces
                                </p>
                            </div>
                            <p className={cn("text-[1.8cqw] leading-relaxed px-[1cqw]", isGold ? 'text-amber-700/75' : 'text-slate-700/75')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                Payable to the bearer on demand as authorized by law.
                            </p>
                        </div>

                        {/* Right Section */}
                        <div className="col-span-3 flex flex-col items-center justify-between">
                            <div className={cn("w-[18cqw] h-[18cqw] flex items-center justify-center", sealColor)}>
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <defs>
                                        <path id={`seal-text-top-${metalType}`} d="M 8,50 A 42,42 0 0,1 92,50" fill="none" />
                                        <path id={`seal-text-bottom-${metalType}`} d="M 92,50 A 42,42 0 0,1 8,50" fill="none" />
                                    </defs>
                                    <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.5" />
                                    <text x="50" y="56" textAnchor="middle" className="font-bold" fill="currentColor" style={{ fontFamily: 'var(--font-cinzel)', fontSize: '20px' }}>
                                        {metalConfig.symbol}
                                    </text>
                                    <text className="uppercase" fill="currentColor" style={{ fontFamily: 'var(--font-eb-garamond)', fontSize: '3.8px', letterSpacing: '0.3px' }}>
                                        <textPath href={`#seal-text-top-${metalType}`} startOffset="50%" textAnchor="middle">
                                            DEPARTMENT OF THE TREASURY
                                        </textPath>
                                    </text>
                                    <text className="uppercase" fill="currentColor" style={{ fontFamily: 'var(--font-eb-garamond)', fontSize: '4.5px', fontWeight: 'bold' }}>
                                        <textPath href={`#seal-text-bottom-${metalType}`} startOffset="50%" textAnchor="middle">
                                            ★ 1789 ★
                                        </textPath>
                                    </text>
                                </svg>
                            </div>
                            <Badge variant="outline" className={cn(badgeBg, textColor, badgeBorder, "text-[1.8cqw] w-full justify-center px-[0.5cqw]")} style={{ fontFamily: 'var(--font-courier)' }}>
                                {serialNumber}
                            </Badge>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={cn("flex items-end justify-between border-t pt-[1cqw] mt-[1cqw]", borderAccent)}>
                        <div className="w-[22cqw] text-center">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Donald_Trump_Signature.svg/1200px-Donald_Trump_Signature.svg.png"
                                alt="Signature"
                                className="h-[3cqw] w-auto mx-auto grayscale opacity-70"
                                style={{ filter: isGold ? 'invert(15%) sepia(50%) saturate(800%) hue-rotate(350deg)' : 'invert(20%) sepia(10%) saturate(500%) hue-rotate(180deg)' }}
                            />
                            <div className={cn("border-t mt-[0.5cqw]", borderAccent)}>
                                <p className={cn("text-[1.3cqw] uppercase tracking-wide mt-[0.3cqw] leading-tight", isGold ? 'text-amber-700/60' : 'text-slate-700/60')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                    Treasurer of the United States
                                </p>
                            </div>
                        </div>

                        <div className="w-[22cqw] text-center">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/John_Snow_signature.png"
                                alt="Secretary Signature"
                                className="h-[3cqw] w-auto mx-auto grayscale opacity-70"
                                style={{ filter: isGold ? 'invert(15%) sepia(50%) saturate(800%) hue-rotate(350deg)' : 'invert(20%) sepia(10%) saturate(500%) hue-rotate(180deg)' }}
                            />
                            <div className={cn("border-t mt-[0.5cqw]", borderAccent)}>
                                <p className={cn("text-[1.3cqw] uppercase tracking-wide mt-[0.3cqw] leading-tight", isGold ? 'text-amber-700/60' : 'text-slate-700/60')} style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                    Secretary of the Treasury
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Corners */}
                <div className={cn("absolute top-[0.8cqw] left-[0.8cqw] w-[3cqw] h-[3cqw] border-t border-l rounded-tl", borderAccent)} />
                <div className={cn("absolute top-[0.8cqw] right-[0.8cqw] w-[3cqw] h-[3cqw] border-t border-r rounded-tr", borderAccent)} />
                <div className={cn("absolute bottom-[0.8cqw] left-[0.8cqw] w-[3cqw] h-[3cqw] border-b border-l rounded-bl", borderAccent)} />
                <div className={cn("absolute bottom-[0.8cqw] right-[0.8cqw] w-[3cqw] h-[3cqw] border-b border-r rounded-br", borderAccent)} />
            </div>
        </div>
    );
}
