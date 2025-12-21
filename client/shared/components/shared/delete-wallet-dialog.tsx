"use client";

import { AlertTriangle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

interface DeleteWalletDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    walletPublicKey: string | null;
    onConfirm: () => void;
}

export function DeleteWalletDialog({
    open,
    onOpenChange,
    walletPublicKey,
    onConfirm
}: DeleteWalletDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Delete Wallet
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this wallet?
                        <br />
                        <code className="mt-2 block text-xs bg-muted p-2 rounded font-mono">
                            {walletPublicKey ? (
                                <>
                                    {walletPublicKey.slice(0, 20)}...{walletPublicKey.slice(-20)}
                                </>
                            ) : (
                                'No wallet selected'
                            )}
                        </code>
                        <br />
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete Wallet
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
