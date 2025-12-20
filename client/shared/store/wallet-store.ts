import { create } from "zustand";
import Cookies from "js-cookie";
import { apiService } from "@/shared/lib/api";
import type { UserStatistics } from "@/shared/types/api";

const ACTIVE_WALLET_COOKIE_KEY = "tff_active_wallet";
const WALLETS_STORAGE_KEY = "tff_wallets";
const COOKIE_EXPIRY_DAYS = 365;

// Cookie options for better persistence
const COOKIE_OPTIONS = {
    expires: COOKIE_EXPIRY_DAYS,
    path: '/',
    sameSite: 'lax' as const,
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

interface WalletStore {
    // State
    activeWallet: string | null;
    wallets: string[];
    userStatistics: UserStatistics | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    addWallet: (wallet: string) => Promise<void>;
    setActiveWallet: (wallet: string) => Promise<void>;
    deleteWallet: (wallet: string) => void;
    fetchUserStatistics: () => Promise<void>;
    initializeFromStorage: () => void;
    refreshCookie: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
    // Initial State
    activeWallet: null,
    wallets: [],
    userStatistics: null,
    isLoading: false,
    error: null,

    // Add new wallet to the list and make it active
    addWallet: async (wallet: string) => {
        set({ isLoading: true, error: null });

        try {
            const { wallets } = get();

            // Check if wallet already exists
            if (wallets.includes(wallet)) {
                throw new Error("Wallet already added");
            }

            // Add wallet to backend
            const response = await apiService.addWallet(wallet);

            if (response.status === "Success" && response.result) {
                const updatedWallets = [...wallets, wallet];

                // Save to localStorage instead of sessionStorage for better persistence
                if (typeof window !== 'undefined') {
                    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));
                }

                // Save active wallet to cookie with proper options
                Cookies.set(ACTIVE_WALLET_COOKIE_KEY, wallet, COOKIE_OPTIONS);

                // Update state
                set({
                    activeWallet: wallet,
                    wallets: updatedWallets,
                    isLoading: false
                });

                // Fetch user statistics
                await get().fetchUserStatistics();
            } else {
                throw new Error("Failed to add wallet");
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to connect wallet";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    // Set active wallet (switch between existing wallets)
    setActiveWallet: async (wallet: string) => {
        const { wallets } = get();

        if (!wallets.includes(wallet)) {
            set({ error: "Wallet not found in list" });
            return;
        }

        // Save active wallet to cookie with proper options
        Cookies.set(ACTIVE_WALLET_COOKIE_KEY, wallet, COOKIE_OPTIONS);

        // Update state
        set({ activeWallet: wallet });

        // Fetch user statistics for new active wallet
        await get().fetchUserStatistics();
    },

    // Delete wallet from list
    deleteWallet: (wallet: string) => {
        const { wallets, activeWallet } = get();

        const updatedWallets = wallets.filter(w => w !== wallet);

        // Save to localStorage instead of sessionStorage for better persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));
        }

        // If deleted wallet was active, clear active wallet or set to first available
        let newActiveWallet = activeWallet;
        if (activeWallet === wallet) {
            newActiveWallet = updatedWallets.length > 0 ? updatedWallets[0] : null;

            if (newActiveWallet) {
                Cookies.set(ACTIVE_WALLET_COOKIE_KEY, newActiveWallet, COOKIE_OPTIONS);
            } else {
                Cookies.remove(ACTIVE_WALLET_COOKIE_KEY, { path: '/' });
            }
        }

        set({
            wallets: updatedWallets,
            activeWallet: newActiveWallet,
            error: null,
        });

        // Fetch statistics for new active wallet
        if (newActiveWallet) {
            get().fetchUserStatistics();
        }
    },

    // Fetch user statistics from backend
    fetchUserStatistics: async () => {
        const { activeWallet } = get();

        set({ isLoading: true, error: null });

        try {
            // Pass active wallet or null to the API
            const response = await apiService.getUserStatistics(activeWallet || null);

            if (response.status === "Success") {
                const result = response.result;

                // Transform array-based holders to objects with wallet and balance
                const transformHolders = (holders: any) => {
                    if (!Array.isArray(holders)) return [];
                    return holders.map((holder, index) => {
                        if (Array.isArray(holder)) {
                            return {
                                rank: index + 1,
                                wallet: holder[0],
                                balance: holder[1]
                            };
                        }
                        return holder;
                    });
                };

                // Transform the data
                const transformedResult = {
                    ...result,
                    main_token_holders: transformHolders(result.main_token_holders),
                    top_purchase_holders: transformHolders(result.top_purchase_holders),
                };

                set({
                    userStatistics: transformedResult,
                    isLoading: false,
                    error: null,
                });
            } else {
                throw new Error("Failed to fetch statistics");
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to fetch user statistics";
            set({ error: errorMessage, isLoading: false });
        }
    },

    // Initialize wallets from storage on app load
    initializeFromStorage: () => {
        // Check if running in browser
        if (typeof window === 'undefined') return;

        const savedActiveWallet = Cookies.get(ACTIVE_WALLET_COOKIE_KEY);
        const savedWalletsJson = localStorage.getItem(WALLETS_STORAGE_KEY);
        const savedWallets = savedWalletsJson ? JSON.parse(savedWalletsJson) : [];

        if (savedActiveWallet && savedWallets.includes(savedActiveWallet)) {
            set({
                activeWallet: savedActiveWallet,
                wallets: savedWallets
            });
        } else if (savedWallets.length > 0) {
            // If active wallet not found but we have wallets, set first as active
            const firstWallet = savedWallets[0];
            Cookies.set(ACTIVE_WALLET_COOKIE_KEY, firstWallet, COOKIE_OPTIONS);
            set({
                activeWallet: firstWallet,
                wallets: savedWallets
            });
        } else {
            set({ wallets: savedWallets });
        }

        // Always fetch statistics (with or without wallet)
        get().fetchUserStatistics();
    },

    // Refresh cookie to extend expiration
    refreshCookie: () => {
        const { activeWallet } = get();
        if (activeWallet && typeof window !== 'undefined') {
            Cookies.set(ACTIVE_WALLET_COOKIE_KEY, activeWallet, COOKIE_OPTIONS);
        }
    },
}));
