import { useEffect } from "react";
import { useWalletStore } from "@/shared/store/wallet-store";

/**
 * Hook to refresh cookie periodically to prevent expiration
 * Refreshes every 24 hours
 */
export function useCookieRefresh() {
    const refreshCookie = useWalletStore((state) => state.refreshCookie);

    useEffect(() => {
        // Refresh immediately on mount
        refreshCookie();

        // Set up interval to refresh every 24 hours (86400000 ms)
        const interval = setInterval(() => {
            refreshCookie();
        }, 24 * 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [refreshCookie]);
}
