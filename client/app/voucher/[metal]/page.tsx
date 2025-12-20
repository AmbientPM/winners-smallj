
import { use } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { MetalCertificate } from "@/shared/components/shared/metal-certificate";
import { METALS, MetalType } from "@/shared/types/api";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

export function generateStaticParams() {
    return Object.keys(METALS).map((metal) => ({
        metal,
    }));
}

export default function VoucherPage({ params }: { params: Promise<{ metal: string }> }) {
    const { metal } = use(params);



    // Validate metal type
    const metalType = metal as MetalType;
    if (!METALS[metalType]) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="p-6 text-center">
                    <h1 className="text-2xl font-bold mb-2">Invalid Metal Type</h1>
                    <p className="text-muted-foreground mb-4">Please select a valid metal type.</p>
                    <Link href="/" className="text-primary hover:underline">
                        Return to Home
                    </Link>
                </Card>
            </div>
        );
    }

    const metalConfig = METALS[metalType];
    const isGold = metalType === 'gold';

    return (
        <main className="min-h-screen">
            <div className="max-w-lg mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 pt-4">
                    <Link
                        href="/"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-cinzel)' }}>
                            {metalConfig.icon} {metalConfig.name} Redemption Voucher
                        </h1>
                        <p className="text-sm text-muted-foreground">Physical bullion claim certificate</p>
                    </div>
                </div>

                {/* Coming Soon Badge */}
                <div className="flex justify-center">
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-sm px-4 py-2",
                            isGold
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-slate-500/10 text-slate-600 border-slate-500/30"
                        )}
                    >
                        Coming Soon
                    </Badge>
                </div>

                {/* Certificate */}
                <MetalCertificate
                    metalType={metalType}
                    serialNumber={`${metalType === 'gold' ? 'G' : 'S'}00000000B`}
                    tokenAmount={metalType === 'gold' ? 1.5 : 125.5}
                    className="mt-4"
                />

                {/* Information Card */}
                <Card className={cn(
                    "p-5 border-2",
                    isGold
                        ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/5 border-amber-500/20"
                        : "bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-slate-500/5 border-slate-500/20"
                )}>
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            isGold ? "bg-amber-500/20" : "bg-slate-500/20"
                        )}>
                            <Info className={cn("w-5 h-5", isGold ? "text-amber-600" : "text-slate-600")} />
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">About {metalConfig.name} Vouchers</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    This certificate represents your ownership of {metalConfig.name.toLowerCase()} tokens and your right to claim physical {metalConfig.name.toLowerCase()} bullion.
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className={cn("mt-0.5", isGold ? "text-amber-600" : "text-slate-600")}>•</span>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Redemption:</span> Convert your digital tokens to physical {metalConfig.name.toLowerCase()}
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className={cn("mt-0.5", isGold ? "text-amber-600" : "text-slate-600")}>•</span>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Authenticity:</span> Each certificate is uniquely numbered and verified
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className={cn("mt-0.5", isGold ? "text-amber-600" : "text-slate-600")}>•</span>
                                    <p className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Security:</span> Backed by {metalConfig.name} reserves held in secure vaults
                                    </p>
                                </div>
                            </div>


                        </div>

                    </div>
                    <div className={cn(
                        "mt-4 p-3 rounded-lg border",
                        isGold
                            ? "bg-amber-500/5 border-amber-500/20"
                            : "bg-slate-500/5 border-slate-500/20"
                    )}>
                        <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Note:</span> Physical redemption features will be available soon.
                            You'll be notified when you can claim your {metalConfig.name.toLowerCase()} bullion.
                        </p>
                    </div>
                </Card>

                {/* Action Buttons (Disabled for now) */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        disabled
                        className="py-3 px-4 bg-muted text-muted-foreground rounded-lg font-medium text-sm cursor-not-allowed"
                    >
                        Request Claim
                    </button>
                    <button
                        disabled
                        className="py-3 px-4 bg-muted text-muted-foreground rounded-lg font-medium text-sm cursor-not-allowed"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </main>
    );
}
