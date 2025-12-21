import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StellarService } from './stellar.service';
import { Asset } from 'stellar-sdk';

@Injectable()
export class StakingService implements OnModuleInit {
    private readonly logger = new Logger(StakingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly stellar: StellarService,
    ) { }

    async onModuleInit() {
        // Start holders update loop
        this.runHoldersLoop().catch((error) => {
            this.logger.error(`Holders loop error: ${error.message}`);
        });

        // Start prices update loop
        this.runPricesLoop().catch((error) => {
            this.logger.error(`Prices loop error: ${error.message}`);
        });
    }

    async parseHolders(asset: Asset): Promise<Record<string, number>> {
        try {
            return await this.stellar.parseHolders(asset);
        } catch (error) {
            this.logger.error(`Can't parse ${asset.getCode()}: ${error.message}`);
            return {};
        }
    }

    async updateHolders(): Promise<void> {
        try {
            // Get all active tokens from database
            const tokens = await this.prisma.token.findMany({
                where: { isActive: true },
            });

            if (tokens.length === 0) {
                this.logger.warn('No active tokens found');
                return;
            }

            // Parse holders for each token
            for (const token of tokens) {
                if (!token.issuerPublic) {
                    this.logger.warn(`Token ${token.code} has no issuer, skipping`);
                    continue;
                }

                const asset = new Asset(token.code, token.issuerPublic);
                const holders = await this.parseHolders(asset);

                this.logger.log(`${token.code}: Found ${Object.keys(holders).length} holders`);

                // Update wallet balances for this token
                for (const [publicKey, balance] of Object.entries(holders)) {
                    // Find wallet
                    const wallet = await this.prisma.wallet.findUnique({
                        where: { publicKey },
                    });

                    if (!wallet) continue;

                    // Upsert wallet balance
                    await this.prisma.walletBalance.upsert({
                        where: {
                            walletId_tokenId: {
                                walletId: wallet.id,
                                tokenId: token.id,
                            },
                        },
                        create: {
                            walletId: wallet.id,
                            tokenId: token.id,
                            balance,
                        },
                        update: {
                            balance,
                        },
                    });
                }

                this.logger.log(`${token.code}: Updated balances in database`);
            }
        } catch (error) {
            this.logger.error(`Unexpected error while updating holders: ${error.message}`);
        }
    }



    async updatePrices(): Promise<void> {
        this.logger.log('Prices task running...');

        const tokens = await this.prisma.token.findMany({
            where: { isActive: true },
        });

        for (const token of tokens) {
            try {
                if (!token.issuerPublic) {
                    this.logger.warn(`Token ${token.code} has no issuer, skipping price update`);
                    continue;
                }

                const asset = new Asset(token.code, token.issuerPublic);
                const assetInfo = await this.stellar.assetInfo(asset);

                if (assetInfo && assetInfo.price) {
                    const price = assetInfo.price;

                    // Create new price record
                    await this.prisma.tokenPrice.create({
                        data: {
                            tokenId: token.id,
                            price,
                        },
                    });

                    this.logger.log(`${token.code} price updated to ${price}`);
                }
            } catch (error) {
                this.logger.error(
                    `Error fetching price for ${token.code}: ${error.message}`,
                );
            }
        }
    }



    // Method to run periodic holders updates
    async runHoldersLoop(): Promise<void> {
        while (true) {
            await this.updateHolders();
            await new Promise((resolve) => setTimeout(resolve, 60 * 1000)); // Every minute
        }
    }

    // Method to run periodic price updates
    async runPricesLoop(): Promise<void> {
        while (true) {
            await this.updatePrices();
            await new Promise((resolve) => setTimeout(resolve, 30 * 60 * 1000)); // Every 30 minutes
        }
    }
}
