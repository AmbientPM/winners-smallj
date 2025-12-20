"use client";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { mockWallets } from "@/shared/lib/mock-data";
import { Copy, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { WalletData } from "@/shared/types/api";
import { Badge } from "@/shared/components/ui/badge";
import { AddWalletDialog } from "@/shared/components/shared/add-wallet-dialog";

export default function WalletsPage() {
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const copyToClipboard = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    return (
        <main className="min-h-screen">
            <div className="max-w-lg mx-auto p-4 space-y-3">
                {/* Header */}
                <div className="py-4">
                    <h1 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                        My Wallets
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your precious metal token wallets
                    </p>
                </div>

                {/* Add Wallet Button */}
                <AddWalletDialog onWalletAdded={() => {
                    console.log("Wallet added successfully");
                }} />

                {/* Wallets List */}
                <div className="space-y-3">
                    {mockWallets.map((wallet: WalletData) => (
                        <Card key={wallet.id} className="p-3">
                            {/* Address & Status */}
                            <div className="flex items-center gap-2">
                                <code className="text-xs flex-1 truncate font-mono text-muted-foreground">
                                    {wallet.address}
                                </code>
                                <div className="flex items-center gap-2 shrink-0">
                                    {wallet.isActive ? (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Pending
                                        </Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => copyToClipboard(wallet.address)}
                                    >
                                        {copiedAddress === wallet.address ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Info Card */}
                <Card className="p-4 bg-muted/50 border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        💡 <strong>Tip:</strong> Each wallet represents a separate address holding your metal-backed tokens.
                        Set one as active to use it for transactions.
                    </p>
                </Card>
            </div>
        </main>
    );
}
