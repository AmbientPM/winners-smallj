"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWalletStore } from "@/shared/store/wallet-store";
import { Loader2, ShieldAlert } from "lucide-react";
import { apiService } from "@/shared/lib/api";
import type { UserData } from "@/shared/types/api";

// Context to share initData across the app
const TelegramContext = createContext<string | null>(null);

export function useTelegramInitData() {
    return useContext(TelegramContext);
}

// Query keys (same as in use-api.ts)
const queryKeys = {
    userStatistics: ['userStatistics'] as const,
};

// Get initData from Telegram WebApp
function getTelegramInitData(): string | null {
    if (typeof window === "undefined") return null;
    
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
        tg.ready();
        tg.expand();
        
        if (tg.initData) {
            console.log("[TG] initData found:", tg.initData.substring(0, 50) + "...");
            return tg.initData;
        }
    }
    
    console.log("[TG] No initData");
    return null;
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
    const [initData, setInitData] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const { initializeFromStorage } = useWalletStore();

    // Initialize Telegram WebApp on mount
    useEffect(() => {
        const data = getTelegramInitData();
        setInitData(data);
        initializeFromStorage();
        setIsReady(true);
    }, [initializeFromStorage]);

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Initializing...</p>
                </div>
            </div>
        );
    }

    return (
        <TelegramContext.Provider value={initData}>
            <TelegramProviderInner initData={initData}>{children}</TelegramProviderInner>
        </TelegramContext.Provider>
    );
}

// Inner component that fetches user data using React Query
function TelegramProviderInner({ 
    children, 
    initData 
}: { 
    children: React.ReactNode;
    initData: string | null;
}) {
    const { setUserData } = useWalletStore();

    // Use React Query for data fetching - this enables invalidateQueries to work!
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.userStatistics,
        queryFn: async () => {
            const response = await apiService.getUserStatistics(initData || undefined);
            return response.user;
        },
        staleTime: 30 * 1000,
        retry: false,
    });

    // Sync user data with wallet store when loaded
    useEffect(() => {
        if (data) {
            setUserData(data);
        }
    }, [data, setUserData]);

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
