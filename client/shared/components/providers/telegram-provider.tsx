"use client";

import { useEffect } from "react";
import { useUserStatistics } from "@/shared/hooks/use-api";
import { useWalletStore } from "@/shared/store/wallet-store";
import { Loader2, ShieldAlert } from "lucide-react";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
    const { data, isLoading, error } = useUserStatistics();
    const { setUserData, initializeFromStorage } = useWalletStore();

    // Initialize wallet store from localStorage on mount
    useEffect(() => {
        initializeFromStorage();
    }, [initializeFromStorage]);

    // Sync user data with wallet store when loaded
    useEffect(() => {
        if (data) {
            setUserData(data);
        }
    }, [data, setUserData]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Show access denied on error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                    <p className="text-sm text-muted-foreground">
                        Failed to verify access. If this problem persists, please contact support.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
