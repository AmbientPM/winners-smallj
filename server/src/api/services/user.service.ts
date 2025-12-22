import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MetalType } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    private generateSerialNumber(): string {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const firstLetter = letters[Math.floor(Math.random() * letters.length)];
        const lastLetter = letters[Math.floor(Math.random() * letters.length)];
        const numbers = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `${firstLetter}${numbers}${lastLetter}`;
    }

    private generateUniqueNumber(): string {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    async getUserStatistics(userId: number) {
        let userWithRelations = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallets: {
                    where: {
                        isDeleted: false,
                    },
                    include: {
                        balances: {
                            include: {
                                token: true,
                            },
                        },
                    },

                },
                certificates: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            },
        });

        if (!userWithRelations) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check if user has certificates, if not - create them
        if (userWithRelations.certificates.length === 0) {
            // Create certificates for both metal types
            await this.prisma.certificate.createMany({
                data: [
                    {
                        userId: userWithRelations.id,
                        metalType: MetalType.SILVER,
                        serialNumber: this.generateSerialNumber(),
                        uniqueNumber: this.generateUniqueNumber(),
                    },
                    {
                        userId: userWithRelations.id,
                        metalType: MetalType.GOLD,
                        serialNumber: this.generateSerialNumber(),
                        uniqueNumber: this.generateUniqueNumber(),
                    }
                ]
            });

            // Refetch user with certificates
            userWithRelations = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    wallets: {
                        where: {
                            isDeleted: false,
                        },
                        include: {
                            balances: {
                                include: {
                                    token: true,
                                },
                            },
                        },
                    },
                    certificates: {
                        orderBy: {
                            createdAt: 'desc'
                        }
                    },
                },
            });

            if (!userWithRelations) {
                throw new HttpException('User not found after certificate creation', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        // Calculate balances only from the active wallet
        let silverBalance = 0;
        let goldBalance = 0;

        const activeWallet = userWithRelations.wallets.find(w => w.isActive);

        if (activeWallet) {
            for (const balance of activeWallet.balances) {
                if (balance.token.code === 'SILVER') {
                    silverBalance += balance.balance;
                } else if (balance.token.code === 'GOLD') {
                    goldBalance += balance.balance;
                }
            }
        }

        // Get latest prices
        const silverToken = await this.prisma.token.findUnique({
            where: { code: 'SILVER' },
            include: {
                prices: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        const goldToken = await this.prisma.token.findUnique({
            where: { code: 'GOLD' },
            include: {
                prices: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        const silverPrice = silverToken?.prices[0]?.price || 0;
        const goldPrice = goldToken?.prices[0]?.price || 0;

        const silverBuyLink = silverToken?.buyLink || null;
        const goldBuyLink = goldToken?.buyLink || null;

        // Calculate ounces
        // Silver: 1 token = 1 oz
        // Gold: 1 token = 0.1 oz
        const silverOunces = silverBalance * 1;
        const goldOunces = goldBalance * 0.1;

        // Calculate USD values based on ounces
        const silverBalanceUSD = silverOunces * silverPrice;
        const goldBalanceUSD = goldOunces * goldPrice;
        const totalBalanceUSD = silverBalanceUSD + goldBalanceUSD;

        return {
            success: true,
            user: {
                id: userWithRelations.id,
                telegramId: userWithRelations.telegramId.toString(),
                telegramUsername: userWithRelations.telegramUsername,
                telegramName: userWithRelations.telegramName,

                wallets: userWithRelations.wallets.map(wallet => ({
                    id: wallet.id,
                    publicKey: wallet.publicKey,
                    isActive: wallet.isActive,
                    verificationStatus: wallet.verificationStatus,


                })),
                certificates: userWithRelations.certificates.map(cert => ({
                    metalType: cert.metalType.toLowerCase(),
                    serialNumber: cert.serialNumber,
                    uniqueNumber: cert.uniqueNumber,
                    tokenAmount: cert.metalType === MetalType.SILVER
                        ? silverOunces
                        : goldOunces
                })),
                balances: {
                    silver: {
                        tokens: silverBalance,
                        ounces: silverOunces,
                        usd: silverBalanceUSD,
                        price: silverPrice,
                        buyLink: silverBuyLink
                    },
                    gold: {
                        tokens: goldBalance,
                        ounces: goldOunces,
                        usd: goldBalanceUSD,
                        price: goldPrice,
                        buyLink: goldBuyLink
                    },
                    total: {
                        usd: totalBalanceUSD
                    }
                }
            }
        };
    }


}
