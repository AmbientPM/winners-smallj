// API Response Types
export interface ApiResponse<T> {
    status: string;
    result: T;
}

// Metal Types
export type MetalType = 'silver' | 'gold';

export interface MetalConfig {
    name: string;
    symbol: string;
    color: string;
    accentColor: string;
    icon: string;
}

export const METALS: Record<MetalType, MetalConfig> = {
    silver: {
        name: 'Silver',
        symbol: 'SILVER',
        color: 'from-slate-100 via-slate-200 to-zinc-100',
        accentColor: 'text-slate-900 border-slate-700',
        icon: '🪙'
    },
    gold: {
        name: 'Gold',
        symbol: 'GOLD',
        color: 'from-amber-100 via-yellow-200 to-amber-100',
        accentColor: 'text-amber-900 border-amber-700',
        icon: '🏆'
    }
};

// Metal Balance Data
export interface MetalBalance {
    metal: MetalType;
    balance: number; // Token balance (SILVER or GOLD token on Stellar)
    price: number; // Price per ounce of metal
    usdValue: number; // balance * price
}

// User Statistics Response
export interface UserStatistics {
    wallets: WalletData[];
    balances: MetalBalance[]; // Array of balances for each metal
    statistics: {
        totalWallets: number;
        totalTokens: number;
        totalUsdValue: number;
    };
}

export interface WalletData {
    id: number;
    address: string;
    balance: number;
    isActive: boolean;
}

// Centralized Certificate Data
export interface CertificateData {
    metalType: MetalType;
    serialNumber?: string;
    tokenAmount?: number; // Amount of tokens (SILVER or GOLD)
}

export interface VerificationData {
    walletId: number;
    verificationCode: string;
    depositAddress: string;
    minAmount: number;
}