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

// Wallet Data
export interface WalletData {
    id: number;
    userId: number;
    publicKey: string;
    balance: number;
    isActive: boolean;
    verificationStatus: 'PENDING' | 'SUCCESS' | 'CANCELED';
    verificationExpiresAt: string | null;
    verificationAttempts: number;
    metadata: any;
    createdAt: string;
    updatedAt: string;
}

// Certificate Data
export interface CertificateData {
    metalType: MetalType;
    serialNumber: string;
    uniqueNumber: string;
    tokenAmount: number;
}

// Balance Data
export interface MetalBalanceData {
    tokens: number;
    ounces?: number;
    usd: number;
    price: number;
    buyLink?: string | null;
}

export interface BalancesData {
    silver: MetalBalanceData;
    gold: MetalBalanceData;
    total: {
        usd: number;
    };
}

// User Data
export interface UserData {
    id: number;
    telegramId: string;
    telegramUsername: string | null;
    telegramName: string;
    createdAt: string;
    updatedAt: string;
    wallets: WalletData[];
    certificates: CertificateData[];
    balances: BalancesData;
}

// User Statistics Response
export interface UserStatisticsResponse {
    success: true;
    user: UserData;
}

// Legacy types (for backward compatibility)
export interface MetalBalance {
    metal: MetalType;
    balance: number;
    price: number;
    usdValue: number;
}

export interface UserStatistics {
    wallets: WalletData[];
    balances: MetalBalance[];
    statistics: {
        totalWallets: number;
        totalTokens: number;
        totalUsdValue: number;
    };
}

export interface VerificationData {
    walletId: number;
    verificationCode: string;
    depositAddress: string;
    minAmount: number;
}