"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Plus, Copy, CheckCircle2, AlertCircle, Clock, Shield } from "lucide-react";
import { VerificationData } from "@/shared/types/api";
import { useAddWallet, useVerifyWallet } from "@/shared/hooks/use-api";

export function AddWalletDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const addWalletMutation = useAddWallet();
    const verifyWalletMutation = useVerifyWallet();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedAddress(text);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    const handleAddWallet = async () => {
        addWalletMutation.mutate(walletAddress, {
            onSuccess: (response) => {
                if (response.needsVerification && response.verificationCode && response.depositAddress) {
                    setVerificationData({
                        walletId: response.wallet.id,
                        verificationCode: response.verificationCode,
                        depositAddress: response.depositAddress,
                        minAmount: response.minAmount || 1
                    });
                    setWalletAddress("");
                } else {
                    // Wallet already verified
                    setWalletAddress("");
                    setIsOpen(false);
                }
            },
        });
    };

    const handleVerifyWallet = async () => {
        if (!verificationData) return;

        verifyWalletMutation.mutate(verificationData.walletId, {
            onSuccess: (response) => {
                if (response.verified && response.verificationStatus === 'SUCCESS') {
                    setVerificationData(null);
                    setIsOpen(false);
                } else {
                    toast.error(response.message || 'Payment not received yet. Please send 1 XLM with the verification code.', {
                        duration: 4000,
                        icon: '⏳',
                    });
                }
            },
        });
    };

    const closeDialog = () => {
        setVerificationData(null);
        setWalletAddress("");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2 h-12 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-bold rounded-xl border border-amber-400/30 shadow-lg">
                    <Plus className="w-4 h-4" />
                    Add Wallet
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {verificationData ? "Verify Wallet" : "Add New Wallet"}
                    </DialogTitle>
                    <DialogDescription>
                        {verificationData
                            ? "Complete the verification process"
                            : "Enter your wallet address"
                        }
                    </DialogDescription>
                </DialogHeader>

                {!verificationData ? (
                    <>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="wallet-address">Wallet Address</Label>
                                <Input
                                    id="wallet-address"
                                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXX..."
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={closeDialog}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleAddWallet}
                                disabled={!walletAddress}
                            >
                                Add Wallet
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-3 py-3">
                            {/* Verification Instructions */}
                            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg border border-amber-500/30">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                                        <Shield className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-foreground mb-1">Wallet Verification</h4>
                                        <p className="text-xs text-muted-foreground">Follow these steps to verify ownership</p>
                                    </div>
                                </div>

                                <div className="space-y-2 ml-0">
                                    <div className="flex gap-2 text-xs">
                                        <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[10px]">1</span>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Send <strong className="text-foreground">{verificationData.minAmount} XLM</strong> to the address below
                                        </p>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                        <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[10px]">2</span>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Add verification code in <strong className="text-foreground">memo field</strong>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                        <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[10px]">3</span>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Click <strong className="text-foreground">"Verify Payment"</strong> after sending
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Deposit Address</Label>
                                    <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
                                        <code className="text-[10px] flex-1 font-mono break-all leading-relaxed">
                                            {verificationData.depositAddress}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 shrink-0 mt-0.5"
                                            onClick={() => copyToClipboard(verificationData.depositAddress)}
                                        >
                                            {copiedAddress === verificationData.depositAddress ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Verification Code (Memo)</Label>
                                    <div className="flex items-center gap-2 p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                                        <code className="text-sm flex-1 font-bold font-mono text-primary text-center break-all">
                                            {verificationData.verificationCode}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 shrink-0"
                                            onClick={() => copyToClipboard(verificationData.verificationCode)}
                                        >
                                            {copiedAddress === verificationData.verificationCode ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <Alert className="bg-blue-500/10 border-blue-500/20">
                                    <AlertCircle className="h-4 w-4 text-blue-500" />
                                    <AlertDescription className="text-xs">
                                        <strong>Important:</strong> You must include the verification code in the memo field of your transaction.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={closeDialog}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleVerifyWallet}
                                disabled={verifyWalletMutation.isPending}
                            >
                                {verifyWalletMutation.isPending ? (
                                    <>
                                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Verify Payment
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
