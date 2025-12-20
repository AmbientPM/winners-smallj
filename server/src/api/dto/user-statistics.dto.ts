import { IsOptional, IsString } from 'class-validator';

export class UserStatisticsDto {
    @IsOptional()
    @IsString()
    initData?: string;
}

export class UserStatisticsResponseDto {
    wallets: {
        id: number;
        publicKey: string;
        balance: number;
        isActive: boolean;
    }[];
    silver_balance: number; // Total token balance
    usdBalance: number; // Total USD value
    silverPrice: number; // Current silver price per ounce
    silverPriceChange24h: number; // 24h price change percentage
    statistics: {
        totalWallets: number;
        totalTokens: number;
        totalUsdValue: number;
    };
}
