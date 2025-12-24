import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { StellarService } from '../../../blockchain/services/stellar.service';
import { Asset } from 'stellar-sdk';

@Injectable()
export class WalletVerificationService {
    private readonly logger = new Logger(WalletVerificationService.name);
    private isProcessingVerifications = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly stellar: StellarService,
    ) { }

    /**
     * Запускается каждую минуту для проверки ожидающих верификации кошельков
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async checkPendingVerifications() {
        // Защита от одновременного выполнения
        if (this.isProcessingVerifications) {
            this.logger.warn('Previous verification check still running, skipping...');
            return;
        }

        this.isProcessingVerifications = true;
        this.logger.log('Checking pending wallet verifications...');

        try {
            // Получаем все кошельки в статусе PENDING (ограничение 100 за раз)
            const pendingWallets = await this.prisma.wallet.findMany({
                where: {
                    verificationStatus: 'PENDING',
                    isActive: false,
                },
                take: 100,
                orderBy: { createdAt: 'asc' },
            });

            if (pendingWallets.length === 0) {
                this.logger.log('No pending verifications found');
                return;
            }

            this.logger.log(`Found ${pendingWallets.length} pending wallet(s) to verify`);

            const settings = await this.prisma.settings.findFirst();
            const depositAddress = settings?.depositAddress;

            if (!depositAddress) {
                this.logger.error('Deposit address not configured');
                return;
            }

            const now = new Date();
            let verifiedCount = 0;
            let canceledCount = 0;

            for (const wallet of pendingWallets) {
                try {
                    // Проверяем не истекло ли время
                    if (wallet.verificationExpiresAt && wallet.verificationExpiresAt < now) {
                        await this.prisma.wallet.update({
                            where: { id: wallet.id },
                            data: {
                                verificationStatus: 'CANCELED',
                                isActive: false,
                            },
                        });
                        canceledCount++;
                        this.logger.log(
                            `Wallet ${wallet.id} verification expired and canceled`,
                        );
                        continue;
                    }

                    const metadata = wallet.metadata as any;
                    const verificationCode = metadata?.verificationCode;

                    if (!verificationCode) {
                        this.logger.warn(
                            `Wallet ${wallet.id} has no verification code, skipping`,
                        );
                        continue;
                    }

                    // Проверяем блокчейн
                    const received = await this.stellar.receive(
                        wallet.publicKey,
                        depositAddress,
                        Asset.native(),
                        verificationCode,
                        1,
                    );

                    if (received) {
                        // Платёж получен - верифицируем кошелёк с транзакцией
                        await this.prisma.$transaction(async (tx) => {
                            // Проверяем что статус все еще PENDING
                            const currentWallet = await tx.wallet.findFirst({
                                where: {
                                    id: wallet.id,
                                    verificationStatus: 'PENDING',
                                },
                            });

                            if (!currentWallet) {
                                this.logger.warn(
                                    `Wallet ${wallet.id} already verified or status changed`,
                                );
                                return;
                            }

                            await tx.wallet.update({
                                where: { id: wallet.id },
                                data: {
                                    isActive: true,
                                    verificationStatus: 'SUCCESS',
                                    metadata: {
                                        verificationCode,
                                        verified: true,
                                        verifiedAt: new Date().toISOString(),
                                    },
                                },
                            });
                        });

                        verifiedCount++;
                        this.logger.log(`Wallet ${wallet.id} successfully verified`);
                    }
                } catch (error) {
                    this.logger.error(
                        `Error verifying wallet ${wallet.id}: ${error.message}`,
                    );
                }
            }

            this.logger.log(
                `Verification check completed: ${verifiedCount} verified, ${canceledCount} canceled`,
            );
        } catch (error) {
            this.logger.error(`Error in checkPendingVerifications: ${error.message}`);
        } finally {
            this.isProcessingVerifications = false;
        }
    }

    /**
     * Запускается каждые 30 минут для очистки устаревших записей
     */
    @Cron(CronExpression.EVERY_30_MINUTES)
    async cleanupCanceledWallets() {
        this.logger.log('Cleaning up old canceled wallets...');

        try {
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);

            // Удаляем отмененные кошельки старше 1 часа
            const result = await this.prisma.wallet.deleteMany({
                where: {
                    verificationStatus: 'CANCELED',
                    updatedAt: {
                        lt: oneHourAgo,
                    },
                },
            });

            this.logger.log(`Cleaned up ${result.count} canceled wallet(s)`);
        } catch (error) {
            this.logger.error(`Error in cleanupCanceledWallets: ${error.message}`);
        }
    }
}
