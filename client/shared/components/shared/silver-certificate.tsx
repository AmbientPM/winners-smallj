"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { CertificateData } from "@/shared/types/api";



export function SilverCertificate({
    serialNumber = "A00000000B",
    tokenAmount = 0,
    className
}: Omit<CertificateData, 'metalType'> & { className?: string }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className={cn("relative aspect-[1.6/1] max-w-md mx-auto", className)}>
            {/* Certificate Container - Card Format */}
            <div className="relative w-full h-full overflow-hidden rounded-xl border-2 border-slate-700/40 shadow-2xl bg-gradient-to-br from-slate-100 via-slate-200 to-zinc-100">
                {/* Background Image - Base Layer */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyScTHJRDQjNidJzXE8Qem7r6XWSWrfojZPw&s")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'sepia(11.3) brightness(1.1)',
                    }}
                />
                {/* Paper Texture Overlay - On Top */}
                <div
                    className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none z-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Engraving Texture Overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="engraving-bg" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="2" y2="2" stroke="#475569" strokeWidth="0.3" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#engraving-bg)" />
                </svg>

                {/* Guilloche Pattern Border */}
                <div className="absolute inset-0 pointer-events-none opacity-60">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="guilloche" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path
                                    d="M0,15 Q7.5,7.5 15,15 T30,15"
                                    stroke="#475569"
                                    strokeWidth="0.4"
                                    fill="none"
                                    opacity="0.12"
                                />
                                <path
                                    d="M15,0 Q22.5,7.5 15,15 T15,30"
                                    stroke="#475569"
                                    strokeWidth="0.4"
                                    fill="none"
                                    opacity="0.12"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#guilloche)" />
                    </svg>
                </div>

                {/* Main Content - Horizontal Card Layout */}
                <div className="relative h-full flex flex-col p-4">
                    {/* Header - Compact */}
                    <div className="flex items-center justify-between border-b border-slate-700/30 pb-2 mb-3">
                        <Badge variant="outline" className="bg-slate-700/10 text-slate-900 border-slate-700/40 text-[9px]" style={{ fontFamily: 'var(--font-courier)' }}>
                            {serialNumber}
                        </Badge>
                        <div className="text-center flex-1">
                            <svg width="100%" height="40" viewBox="0 0 250 40" className="overflow-visible">
                                <defs>
                                    <path id="curve" d="M 30,35 Q 125,8 220,35" fill="transparent" />
                                </defs>
                                <text
                                    className="font-bold tracking-[0.2em]"
                                    style={{
                                        fontFamily: 'var(--font-cinzel)',
                                        fontSize: '16px',
                                        fill: '#334155',
                                        paintOrder: 'stroke fill',
                                        stroke: '#000',
                                        strokeWidth: '0.5px'
                                    }}
                                >
                                    <textPath href="#curve" startOffset="50%" textAnchor="middle">
                                        UNITED STATES
                                    </textPath>
                                </text>
                            </svg>
                            <p className="text-[9px] text-slate-700/80 uppercase tracking-widest -mt-2">Silver Certificate</p>
                        </div>
                        <Badge variant="outline" className="bg-slate-700/10 text-slate-900 border-slate-700/40 text-[9px]" style={{ fontFamily: 'var(--font-courier)' }}>
                            2025
                        </Badge>
                    </div>

                    {/* Main Body - Horizontal Layout */}
                    <div className="flex gap-3 flex-1">
                        {/* Certificate Text - Compact */}
                        <div className="flex-1 flex flex-col justify-center py-2 space-y-4">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-700/90 uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-eb-garamond)' }}>This Certifies That</p>
                                <div className="border-2 border-slate-700/40 rounded-lg px-4 py-2.5 bg-white/60 inline-block shadow-sm">
                                    <p className="text-3xl font-bold text-slate-900 leading-none" style={{ fontFamily: 'var(--font-cinzel)' }}>
                                        {tokenAmount.toFixed(2)}
                                    </p>
                                    <p className="text-[11px] text-slate-700/80 mt-1 tracking-wide" style={{ fontFamily: 'var(--font-eb-garamond)' }}>SILVER OUNCES</p>
                                </div>
                            </div>

                            <div className="text-center px-2">
                                <p className="text-[9px] text-slate-700/75 leading-relaxed mb-1.5" style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                    Are deposited in the Treasury of the
                                </p>
                                <p className="text-[12px] font-bold text-slate-900 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'var(--font-cinzel)' }}>
                                    Silver Ounce Reserve
                                </p>
                                <p className="text-[9px] text-slate-700/75 leading-relaxed" style={{ fontFamily: 'var(--font-eb-garamond)' }}>
                                    Payable to the bearer on demand
                                </p>
                            </div>
                        </div>

                        {/* Portrait Section - Smaller */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className="w-24 h-28 border-2 border-slate-700/40 rounded overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 relative">
                                {/* Trump Portrait */}
                                <img
                                    src="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i0tuSai1hrs4/v0/640x-1.jpg"
                                    alt="Trump Portrait"
                                    className="absolute inset-0 w-full h-full object-cover grayscale  opacity-80"
                                />
                                {/* Engraving effect overlay */}
                                <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="engraving" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
                                            <line x1="0" y1="0" x2="2" y2="2" stroke="#475569" strokeWidth="0.3" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#engraving)" />
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
                                <div className="border-t border-slate-700/40 mt-1">
                                    <p className="text-[6px] text-slate-700/60 uppercase tracking-wide mt-0.5 leading-tight" style={{ fontFamily: 'var(--font-eb-garamond)' }}>
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
                        <p className="text-4xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-cinzel)' }}>
                            CLAIM
                        </p>
                        <p className="text-lg text-center text-slate-900 -mt-1" style={{ fontFamily: 'var(--font-cinzel)' }}>
                            COMING SOON
                        </p>
                    </div>
                </div>

                {/* Decorative Corners */}
                <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-2 border-l-2 border-slate-700/40 rounded-tl" />
                <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-2 border-r-2 border-slate-700/40 rounded-tr" />
                <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-2 border-l-2 border-slate-700/40 rounded-bl" />
                <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-2 border-r-2 border-slate-700/40 rounded-br" />
            </div>
        </div>
    );
}
