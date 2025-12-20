import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SilverPriceService } from '../../blockchain/services/silver-price.service';
import { StellarService } from '../../blockchain/services/stellar.service';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly silverPrice: SilverPriceService,
        private readonly stellar: StellarService,
    ) { }

    async getUserStatistics(userId: number) {
        const userWithRelations = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallets: {
                    where: { isActive: true },
                },
            },
        });

        if (!userWithRelations) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Get silver price data
        const silverPriceData = await this.silverPrice.getSilverPrice();

        // Get settings with token info
        const settings = await this.prisma.settings.findFirst();

        // Calculate total token balance across all active wallets
        let totalTokenBalance = 0;
        const walletsWithBalances = [];

        for (const wallet of userWithRelations.wallets) {
            try {
                // Get balance from Stellar for each wallet
                const balance = settings?.issuerPublic
                    ? await this.stellar.getBalance(wallet.publicKey, {
                        code: 'SILVER', // Silver token code
                        issuer: settings.issuerPublic,
                    })
                    : 0;

                totalTokenBalance += balance;
                walletsWithBalances.push({
                    ...wallet,
                    balance,
                });
            } catch (error) {
                // If wallet doesn't exist or has error, set balance to 0
                walletsWithBalances.push({
                    ...wallet,
                    balance: 0,
                });
            }
        }

        // Calculate USD value (token balance * silver price per ounce)
        const usdBalance = totalTokenBalance * silverPriceData.price;

        return {
            wallets: walletsWithBalances,
            balance: totalTokenBalance,
            usdBalance,
            silverPrice: silverPriceData.price,
            silverPriceChange24h: silverPriceData.chp,
            statistics: {
                totalWallets: walletsWithBalances.length,
                totalTokens: totalTokenBalance,
                totalUsdValue: usdBalance,
            },
        };
    }

    async depositToCard(userId: number, amount: number) {
        if (amount <= 0) {
            throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                xlmBalance: user.xlmBalance + amount,
            },
        });

        return {
            success: true,
            newBalance: updatedUser.xlmBalance,
        };
    }

    async withdrawFromCard(userId: number, amount: number) {
        if (amount <= 0) {
            throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        if (user.xlmBalance < amount) {
            throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                xlmBalance: user.xlmBalance - amount,
            },
        });

        return {
            success: true,
            newBalance: updatedUser.xlmBalance,
        };
    }
}
