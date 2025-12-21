"use client";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Copy, CheckCircle2, Clock, Loader2, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { WalletData } from "@/shared/types/api";
import { Badge } from "@/shared/components/ui/badge";
import { AddWalletDialog } from "@/shared/components/shared/add-wallet-dialog";
import { DeleteWalletDialog } from "@/shared/components/shared/delete-wallet-dialog";
import { useUserStatistics, useDeleteWallet, useSetActiveWallet } from "@/shared/hooks/use-api";

export default function WalletsPage() {
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [walletToDelete, setWalletToDelete] = useState<{ id: number; publicKey: string } | null>(null);
    const { data, isLoading, error } = useUserStatistics();
    const deleteWalletMutation = useDeleteWallet();
    const setActiveWalletMutation = useSetActiveWallet();

    const wallets = data?.wallets || [];

    const copyToClipboard = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    const handleDeleteWallet = async (walletId: number, publicKey: string) => {
        setWalletToDelete({ id: walletId, publicKey });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!walletToDelete) return;

        deleteWalletMutation.mutate({ walletId: walletToDelete.id, publicKey: walletToDelete.publicKey });
        setDeleteDialogOpen(false);
        setWalletToDelete(null);
    };

    const handleSetActiveWallet = async (walletId: number) => {
        setActiveWalletMutation.mutate(walletId);
    };

    return (
        <main className="min-h-screen">
            <div className="max-w-lg mx-auto p-4 space-y-4">
                {/* Header */}
                <div className="py-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent mb-1" style={{ fontFamily: 'var(--font-cinzel)' }}>
                        My Wallets
                    </h1>
                    <p className="text-sm text-amber-200/50">
                        Manage your precious metal token wallets
                    </p>
                </div>

                {/* Add Wallet Button */}
                <AddWalletDialog />

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-400/50" />
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <Card className="p-4 bg-red-950/30 border-red-500/30 rounded-xl">
                        <p className="text-sm text-red-400">
                            Failed to load wallets
                        </p>
                    </Card>
                )}

                {/* Wallets List */}
                {!isLoading && !error && (
                    <div className="space-y-3">
                        {wallets.length === 0 ? (
                            <Card className="p-6 text-center bg-amber-950/20 border-amber-500/20 rounded-xl">
                                <p className="text-sm text-amber-200/50">
                                    No wallets yet. Add your first wallet to get started!
                                </p>
                            </Card>
                        ) : (
                            [...wallets].sort((a, b) => {
                                if (a.isActive && !b.isActive) return -1;
                                if (!a.isActive && b.isActive) return 1;
                                return 0;
                            }).map((wallet: WalletData) => (
                                <Card key={wallet.id} className="p-3 bg-amber-950/20 border-amber-500/20 rounded-xl">
                                    {/* Address & Status */}
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs flex-1 truncate font-mono text-amber-200/60">
                                            {wallet.publicKey}
                                        </code>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {wallet.verificationStatus === 'SUCCESS' ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            ) : wallet.verificationStatus === 'PENDING' ? (
                                                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                                                    Canceled
                                                </Badge>
                                            )}

                                            {/* Active/Set Active Button */}
                                            {wallet.verificationStatus === 'SUCCESS' && (
                                                wallet.isActive ? (
                                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                                        onClick={() => handleSetActiveWallet(wallet.id)}
                                                        disabled={setActiveWalletMutation.isPending}
                                                    >
                                                        {setActiveWalletMutation.isPending ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Check className="w-3 h-3" />
                                                        )}
                                                    </Button>
                                                )
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-amber-200/50 hover:text-amber-200 hover:bg-amber-500/10"
                                                onClick={() => copyToClipboard(wallet.publicKey)}
                                            >
                                                {copiedAddress === wallet.publicKey ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => handleDeleteWallet(wallet.id, wallet.publicKey)}
                                                disabled={deleteWalletMutation.isPending}
                                            >
                                                {deleteWalletMutation.isPending ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Info Card */}
                <Card className="p-4 bg-amber-950/20 border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/50 leading-relaxed">
                        💡 <strong className="text-amber-200/70">Tip:</strong> Only one wallet can be active at a time. Your balances and transactions are calculated only from the active wallet. Click "Set as Active" to switch between verified wallets.
                    </p>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteWalletDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                walletPublicKey={walletToDelete?.publicKey || null}
                onConfirm={confirmDelete}
            />
        </main>
    );
}
