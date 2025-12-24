import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { StellarService } from '../../../blockchain/services/stellar.service';
import { Asset } from 'stellar-sdk';

@Injectable()
export class WalletService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stellar: StellarService,
    ) { }

    /**
     * Добавление кошелька с верификацией если нужно
     */
    async addWallet(userId: number, publicKey: string) {
        // Проверяем существует ли кошелёк в блокчейне
        const exists = await this.stellar.checkPublicKey(publicKey);
        if (!exists) {
            throw new HttpException(
                'Wallet does not exist in blockchain',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Проверяем есть ли кошелек в БД (включая удаленные из-за unique constraint)
        const existingWallet = await this.prisma.wallet.findFirst({
            where: {
                publicKey,
            },
        });

        if (existingWallet) {
            // Кошелек существует в БД
            if (existingWallet.isDeleted) {
                // Кошелек был удалён - восстанавливаем для текущего пользователя
                return await this.prisma.$transaction(async (tx) => {
                    await tx.wallet.updateMany({
                        where: {
                            userId,
                            isDeleted: false,
                        },
                        data: { isActive: false },
                    });

                    const restoredWallet = await tx.wallet.update({
                        where: { id: existingWallet.id },
                        data: {
                            userId,
                            isActive: true,
                            isDeleted: false,
                            verificationStatus: 'SUCCESS',
                            metadata: {
                                verified: true,
                                verifiedAt: new Date().toISOString(),
                                restoredAt: new Date().toISOString(),
                            },
                        },
                    });

                    return {
                        success: true,
                        message: 'Wallet restored and activated',
                        wallet: {
                            id: restoredWallet.id,
                            publicKey: restoredWallet.publicKey,
                            verificationStatus: 'SUCCESS',
                        },
                    };
                });
            }

            if (existingWallet.userId === userId) {
                // Принадлежит текущему пользователю - просто активируем
                return await this.prisma.$transaction(async (tx) => {
                    await tx.wallet.updateMany({
                        where: {
                            userId,
                            isDeleted: false,
                        },
                        data: { isActive: false },
                    });

                    const updatedWallet = await tx.wallet.update({
                        where: { id: existingWallet.id },
                        data: { isActive: true },
                    });

                    return {
                        success: true,
                        message: 'Wallet activated',
                        wallet: {
                            id: updatedWallet.id,
                            publicKey: updatedWallet.publicKey,
                            verificationStatus: 'SUCCESS',
                        },
                    };
                });
            } else {
                // Принадлежит другому пользователю
                if (existingWallet.wasVerifiedWithDeposit) {
                    // Был верифицирован депозитом - НЕЛЬЗЯ перепривязать
                    throw new HttpException(
                        'This wallet is already registered and verified. Cannot be reassigned.',
                        HttpStatus.FORBIDDEN,
                    );
                } else {
                    // НЕ был верифицирован депозитом - можно перепривязать, но с верификацией
                    const verificationCode = this.generateVerificationCode();
                    const settings = await this.prisma.settings.findFirst();
                    const depositAddress = settings?.depositAddress;
                    const minAmount = settings?.depositAmount || 1;

                    if (!depositAddress) {
                        throw new HttpException(
                            'Deposit address not configured',
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        );
                    }

                    const expiresAt = new Date();
                    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

                    // Обновляем существующую запись - перепривязываем к новому пользователю с PENDING статусом
                    const wallet = await this.prisma.wallet.update({
                        where: { id: existingWallet.id },
                        data: {
                            userId,
                            isActive: false,
                            verificationStatus: 'PENDING',
                            verificationExpiresAt: expiresAt,
                            verificationAttempts: 0,
                            wasVerifiedWithDeposit: false,
                            metadata: {
                                verificationCode,
                                verified: false,
                            },
                        },
                    });

                    return {
                        success: true,
                        needsVerification: true,
                        verificationCode,
                        depositAddress,
                        minAmount,
                        message: `This wallet is already registered. Send at least ${minAmount} XLM to ${depositAddress} with memo: ${verificationCode} to verify ownership and re-assign it. You have 15 minutes.`,
                        wallet: {
                            id: wallet.id,
                            publicKey: wallet.publicKey,
                            verificationStatus: 'PENDING',
                        },
                        expiresAt,
                    };
                }
            }
        }

        // Кошелек не существует в БД - добавляем без верификации
        return await this.prisma.$transaction(async (tx) => {
            // Повторная проверка внутри транзакции для предотвращения race condition
            const doubleCheck = await tx.wallet.findFirst({
                where: { publicKey },
            });

            if (doubleCheck) {
                throw new HttpException(
                    'Wallet was just added by another request',
                    HttpStatus.CONFLICT,
                );
            }

            // Деактивируем все остальные кошельки пользователя
            await tx.wallet.updateMany({
                where: {
                    userId,
                    isDeleted: false,
                },
                data: { isActive: false },
            });

            const wallet = await tx.wallet.create({
                data: {
                    userId,
                    publicKey,
                    isActive: true,
                    verificationStatus: 'SUCCESS',
                    verificationAttempts: 0,
                    wasVerifiedWithDeposit: false,
                    metadata: {
                        verified: true,
                        verifiedAt: new Date().toISOString(),
                    },
                },
            });

            return {
                success: true,
                message: 'Wallet added successfully',
                wallet: {
                    id: wallet.id,
                    publicKey: wallet.publicKey,
                    verificationStatus: 'SUCCESS',
                },
            };
        });
    }

    /**
     * Шаг 2: Проверяем получили ли платёж с правильным memo
     */
    async verifyWallet(userId: number, walletId: number) {
        const wallet = await this.prisma.wallet.findFirst({
            where: {
                id: walletId,
                userId,
                verificationStatus: 'PENDING', // Только неподтверждённые
            },
        });

        if (!wallet) {
            throw new HttpException('Wallet not found or already verified', HttpStatus.NOT_FOUND);
        }

        // Проверяем не истекло ли время
        const now = new Date();
        if (wallet.verificationExpiresAt && wallet.verificationExpiresAt < now) {
            await this.prisma.wallet.update({
                where: { id: walletId },
                data: {
                    verificationStatus: 'CANCELED',
                    isActive: false,
                },
            });
            throw new HttpException(
                'Verification time expired. Please start again.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const metadata = wallet.metadata as any;
        const verificationCode = metadata?.verificationCode;

        if (!verificationCode) {
            throw new HttpException(
                'Verification code not found',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Получаем адрес получателя из настроек
        const settings = await this.prisma.settings.findFirst();
        const depositAddress = settings?.depositAddress;

        if (!depositAddress) {
            throw new HttpException(
                'Deposit address not configured',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // Проверяем блокчейн: пришли ли деньги с правильным memo
        const received = await this.stellar.receive(
            wallet.publicKey, // От кого ждём
            depositAddress, // Куда должны прийти
            Asset.native(), // XLM (нативная валюта)
            verificationCode, // Проверяем memo
            1, // Минимум 1 XLM
        );

        // Увеличиваем счетчик попыток
        await this.prisma.wallet.update({
            where: { id: walletId },
            data: {
                verificationAttempts: { increment: 1 },
            },
        });

        if (!received) {
            return {
                success: false,
                verified: false,
                verificationStatus: 'PENDING',
                message: 'Payment not received yet. Please send 1 XLM with the verification code.',
                attemptsCount: wallet.verificationAttempts + 1,
            };
        }

        // ✅ Платёж получен! Выполняем все обновления атомарно
        return await this.prisma.$transaction(async (tx) => {
            // Проверяем что кошелек все еще в статусе PENDING (защита от повторной верификации)
            const currentWallet = await tx.wallet.findFirst({
                where: {
                    id: walletId,
                    userId,
                    verificationStatus: 'PENDING',
                },
            });

            if (!currentWallet) {
                throw new HttpException(
                    'Wallet already verified or status changed',
                    HttpStatus.CONFLICT,
                );
            }

            // Удаляем старую привязку кошелька у другого пользователя (если была)
            await tx.wallet.updateMany({
                where: {
                    publicKey: wallet.publicKey,
                    isDeleted: false,
                    NOT: {
                        id: walletId,
                    },
                },
                data: {
                    isDeleted: true,
                    isActive: false,
                },
            });

            // Деактивируем все кошельки текущего пользователя
            await tx.wallet.updateMany({
                where: { userId },
                data: { isActive: false },
            });

            // Активируем и верифицируем кошелек
            await tx.wallet.update({
                where: { id: walletId },
                data: {
                    isActive: true,
                    verificationStatus: 'SUCCESS',
                    wasVerifiedWithDeposit: true,
                    metadata: {
                        verificationCode,
                        verified: true,
                        verifiedAt: new Date().toISOString(),
                    },
                },
            });

            return {
                success: true,
                verified: true,
                verificationStatus: 'SUCCESS',
                message: 'Wallet verified successfully!',
            };
        });
    }

    /**
     * Генерирует случайный код для проверки
     */
    private generateVerificationCode(): string {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
        return `NWO${timestamp}${random}`;
    }

    async deleteWallet(userId: number, walletId: number) {
        const wallet = await this.prisma.wallet.findFirst({
            where: {
                id: walletId,
                userId,
                isDeleted: false,
            },
        });

        if (!wallet) {
            throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
        }

        await this.prisma.wallet.update({
            where: { id: walletId },
            data: {
                isActive: false,
                isDeleted: true,
            },
        });

        return {
            success: true,
            message: 'Wallet deleted successfully',
        };
    }

    async setActiveWallet(userId: number, walletId: number) {
        const wallet = await this.prisma.wallet.findFirst({
            where: {
                id: walletId,
                userId,
                verificationStatus: 'SUCCESS',
                isDeleted: false,
            },
        });

        if (!wallet) {
            throw new HttpException(
                'Wallet not found or not verified',
                HttpStatus.NOT_FOUND,
            );
        }

        return await this.prisma.$transaction(async (tx) => {
            // Деактивируем все кошельки пользователя
            await tx.wallet.updateMany({
                where: {
                    userId,
                    isDeleted: false,
                },
                data: { isActive: false },
            });

            // Активируем выбранный кошелек
            await tx.wallet.update({
                where: { id: walletId },
                data: { isActive: true },
            });

            return {
                success: true,
                message: 'Wallet activated successfully',
            };
        });
    }
}
