
import { create } from 'zustand';
import Cookies from 'js-cookie';
import type { UserData } from '@/shared/types/api';

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
    userData: UserData | null;
    error: string | null;

    // Actions
    addWallet: (wallet: string) => void;
    setActiveWallet: (wallet: string) => void;
    deleteWallet: (wallet: string) => void;
    setUserData: (data: UserData | null) => void;
    initializeFromStorage: () => void;
    refreshCookie: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
    // Initial State
    activeWallet: null,
    wallets: [],
    userData: null,
    error: null,

    // Add new wallet to the list and make it active
    addWallet: (wallet: string) => {
        const { wallets } = get();

        if (wallets.includes(wallet)) {
            set({ error: 'Wallet already exists' });
            return;
        }

        const updatedWallets = [...wallets, wallet];

        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));
        }

        // Save active wallet to cookie
        Cookies.set(ACTIVE_WALLET_COOKIE_KEY, wallet, COOKIE_OPTIONS);

        // Update state
        set({
            wallets: updatedWallets,
            activeWallet: wallet,
            error: null,
        });
    },

    // Set active wallet (switch between existing wallets)
    setActiveWallet: (wallet: string) => {
        const { wallets } = get();

        if (!wallets.includes(wallet)) {
            set({ error: 'Wallet not found' });
            return;
        }

        // Save active wallet to cookie with proper options
        Cookies.set(ACTIVE_WALLET_COOKIE_KEY, wallet, COOKIE_OPTIONS);

        // Update state
        set({ activeWallet: wallet, error: null });
    },

    // Delete wallet from list
    deleteWallet: (wallet: string) => {
        const { wallets, activeWallet } = get();

        const updatedWallets = wallets.filter(w => w !== wallet);

        // Save to localStorage
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
                Cookies.remove(ACTIVE_WALLET_COOKIE_KEY);
            }
        }

        set({
            wallets: updatedWallets,
            activeWallet: newActiveWallet,
            error: null,
        });
    },

    // Set user data from TanStack Query
    setUserData: (data: UserData | null) => {
        set({ userData: data, error: null });
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
                wallets: savedWallets,
                activeWallet: savedActiveWallet,
            });
        } else if (savedWallets.length > 0) {
            const firstWallet = savedWallets[0];
            Cookies.set(ACTIVE_WALLET_COOKIE_KEY, firstWallet, COOKIE_OPTIONS);
            set({
                wallets: savedWallets,
                activeWallet: firstWallet,
            });
        } else {
            set({ wallets: [], activeWallet: null });
        }
    },

    // Refresh cookie to extend expiration
    refreshCookie: () => {
        const { activeWallet } = get();
        if (activeWallet && typeof window !== 'undefined') {
            Cookies.set(ACTIVE_WALLET_COOKIE_KEY, activeWallet, COOKIE_OPTIONS);
        }
    },
}));
