"use client";

import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { MetalCertificate } from "@/shared/components/shared/metal-certificate";
import { METALS, MetalType } from "@/shared/types/api";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { useWalletStore } from "@/shared/store/wallet-store";

interface VoucherContentProps {
    metalType: MetalType;
}

export function VoucherContent({ metalType }: VoucherContentProps) {
    const { userData } = useWalletStore();
    const metalConfig = METALS[metalType];
    const isGold = metalType === 'gold';

    // Get certificate for this metal type
    const certificate = userData?.certificates?.find((cert: any) => cert.metalType === metalType);
    const serialNumber = certificate?.serialNumber || `${isGold ? 'G' : 'S'}00000000B`;
    const tokenAmount = certificate?.tokenAmount || 0;
    const uniqueNumber = certificate?.uniqueNumber || '000000001';

    return (
        <main className="min-h-screen">
            <div className="max-w-lg mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 pt-4">
                    <Link
                        href="/"
                        className="p-2 hover:bg-amber-500/10 rounded-xl transition-colors border border-transparent hover:border-amber-500/20"
                    >
                        <ArrowLeft className="w-5 h-5 text-amber-200/70" />
                    </Link>
                    <div className="flex-1">
                        <h1 className={cn(
                            "text-xl font-bold",
                            isGold
                                ? "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent"
                                : "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-clip-text text-transparent"
                        )} style={{ fontFamily: 'var(--font-raleway)' }}>
                            {metalConfig.icon} {metalConfig.name} Voucher
                        </h1>
                        <p className="text-xs text-amber-200/50">Physical bullion claim certificate</p>
                    </div>
                </div>

                {/* Certificate */}
                <MetalCertificate
                    metalType={metalType}
                    serialNumber={serialNumber}
                    tokenAmount={tokenAmount}
                    uniqueNumber={uniqueNumber}
                    className="mt-4"
                />

                {/* Information Card */}
                <Card className={cn(
                    "p-5 border rounded-2xl",
                    isGold
                        ? "bg-gradient-to-br from-amber-950/40 via-yellow-950/20 to-amber-950/30 border-amber-500/20"
                        : "bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/30 border-slate-500/20"
                )}>
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "p-2 rounded-xl flex-shrink-0 border",
                            isGold ? "bg-amber-500/15 border-amber-500/30" : "bg-slate-500/15 border-slate-500/30"
                        )}>
                            <Info className={cn("w-5 h-5", isGold ? "text-amber-400" : "text-slate-300")} />
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h3 className={cn(
                                    "font-semibold mb-1",
                                    isGold ? "text-amber-200" : "text-slate-200"
                                )}>About {metalConfig.name} Vouchers</h3>
                                <p className="text-sm text-amber-200/50 leading-relaxed">
                                    This certificate represents your ownership of {metalConfig.name.toLowerCase()} tokens and your right to claim physical {metalConfig.name.toLowerCase()} bullion.
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className={cn("mt-0.5", isGold ? "text-amber-400" : "text-slate-400")}>•</span>
                                    <p className="text-amber-200/50">
                                        <span className={cn("font-medium", isGold ? "text-amber-200" : "text-slate-200")}>Redemption:</span> Convert your digital tokens to physical {metalConfig.name.toLowerCase()}
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className={cn("mt-0.5", isGold ? "text-amber-400" : "text-slate-400")}>•</span>
                                    <p className="text-amber-200/50">
                                        <span className={cn("font-medium", isGold ? "text-amber-200" : "text-slate-200")}>Authenticity:</span> Each certificate is uniquely numbered and verified
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className={cn("mt-0.5", isGold ? "text-amber-400" : "text-slate-400")}>•</span>
                                    <p className="text-amber-200/50">
                                        <span className={cn("font-medium", isGold ? "text-amber-200" : "text-slate-200")}>Security:</span> Backed by {metalConfig.name} reserves held in secure vaults
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cn(
                        "mt-4 p-3 rounded-xl border",
                        isGold
                            ? "bg-amber-500/5 border-amber-500/15"
                            : "bg-slate-500/5 border-slate-500/15"
                    )}>
                        <p className="text-xs text-amber-200/40">
                            <span className={cn("font-semibold", isGold ? "text-amber-200/70" : "text-slate-200/70")}>Note:</span> Physical redemption features will be available soon.
                            You'll be notified when you can claim your {metalConfig.name.toLowerCase()} bullion.
                        </p>
                    </div>
                </Card>

                {/* Action Buttons (Disabled for now) */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        disabled
                        className={cn(
                            "py-3 px-4 rounded-xl font-medium text-sm cursor-not-allowed border",
                            isGold
                                ? "bg-amber-950/30 text-amber-200/30 border-amber-500/10"
                                : "bg-slate-900/30 text-slate-200/30 border-slate-500/10"
                        )}
                    >
                        Request Claim
                    </button>
                    <button
                        disabled
                        className={cn(
                            "py-3 px-4 rounded-xl font-medium text-sm cursor-not-allowed border",
                            isGold
                                ? "bg-amber-950/30 text-amber-200/30 border-amber-500/10"
                                : "bg-slate-900/30 text-slate-200/30 border-slate-500/10"
                        )}
                    >
                        View Details
                    </button>
                </div>
            </div>
        </main>
    );
}
