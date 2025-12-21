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
     * Шаг 1: Начинаем процесс добавления кошелька
     * Генерируем уникальный код для проверки
     */
    async addWallet(userId: number, publicKey: string) {
        // Проверяем есть ли уже кошелёк у этого пользователя
        const userWallet = await this.prisma.wallet.findFirst({
            where: {
                userId,
                publicKey,
            },
        });

        if (userWallet) {
            // Если кошелек уже привязан к этому пользователю
            if (userWallet.isDeleted && userWallet.verificationStatus === 'SUCCESS') {
                // Кошелек был удален, но уже верифицирован - просто восстанавливаем и активируем
                // Деактивируем все остальные кошельки
                await this.prisma.wallet.updateMany({
                    where: {
                        userId,
                        isDeleted: false,
                    },
                    data: { isActive: false },
                });

                const updatedWallet = await this.prisma.wallet.update({
                    where: { id: userWallet.id },
                    data: {
                        isActive: true,
                        isDeleted: false,
                    },
                });

                return {
                    success: true,
                    message: 'Wallet restored and activated',
                    wallet: {
                        id: updatedWallet.id,
                        publicKey: updatedWallet.publicKey,
                        verificationStatus: 'SUCCESS',
                    },
                };
            } else if (userWallet.isDeleted) {
                // Кошелек был удален и не верифицирован - начинаем верификацию заново
                const verificationCode = this.generateVerificationCode();
                const settings = await this.prisma.settings.findFirst();
                const depositAddress = settings?.depositAddress;

                if (!depositAddress) {
                    throw new HttpException(
                        'Deposit address not configured',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }

                const expiresAt = new Date();
                expiresAt.setMinutes(expiresAt.getMinutes() + 15);

                const updatedWallet = await this.prisma.wallet.update({
                    where: { id: userWallet.id },
                    data: {
                        isActive: false,
                        isDeleted: false,
                        verificationStatus: 'PENDING',
                        verificationExpiresAt: expiresAt,
                        verificationAttempts: 0,
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
                    minAmount: 1,
                    message: `Send at least 1 XLM to ${depositAddress} with memo: ${verificationCode}. You have 15 minutes.`,
                    wallet: {
                        id: updatedWallet.id,
                        publicKey: updatedWallet.publicKey,
                        verificationStatus: 'PENDING',
                    },
                    expiresAt,
                };
            } else if (userWallet.verificationStatus === 'SUCCESS') {
                // Уже верифицирован - просто активируем
                const updatedWallet = await this.prisma.wallet.update({
                    where: { id: userWallet.id },
                    data: { isActive: true, isDeleted: false },
                });

                return {
                    success: true,
                    message: 'Wallet already added and verified',
                    wallet: {
                        id: updatedWallet.id,
                        publicKey: updatedWallet.publicKey,
                        verificationStatus: 'SUCCESS',
                    },
                };
            } else if (userWallet.verificationStatus === 'PENDING') {
                // Проверяем не истекло ли время
                const now = new Date();
                if (userWallet.verificationExpiresAt && userWallet.verificationExpiresAt > now) {
                    // Время еще не истекло - возвращаем тот же код
                    const metadata = userWallet.metadata as any;
                    return {
                        success: true,
                        needsVerification: true,
                        verificationCode: metadata?.verificationCode,
                        depositAddress: (await this.prisma.settings.findFirst())?.depositAddress,
                        minAmount: 1,
                        message: `Wallet verification pending. Send at least 1 XLM with memo: ${metadata?.verificationCode}`,
                        wallet: {
                            id: userWallet.id,
                            publicKey: userWallet.publicKey,
                            verificationStatus: 'PENDING',
                        },
                        expiresAt: userWallet.verificationExpiresAt,
                    };
                } else {
                    // Время истекло - отменяем и создаем новый
                    await this.prisma.wallet.update({
                        where: { id: userWallet.id },
                        data: {
                            verificationStatus: 'CANCELED',
                            isActive: false,
                        },
                    });
                    // Продолжаем создание нового
                }
            }
        }

        // Проверяем не добавлен ли этот кошелёк другому пользователю (и не удален)
        const existingWallet = await this.prisma.wallet.findFirst({
            where: {
                publicKey,
                isDeleted: false,
            },
        });

        if (existingWallet) {
            throw new HttpException('Wallet already exists', HttpStatus.BAD_REQUEST);
        }

        // Проверяем существует ли кошелёк в блокчейне
        const exists = await this.stellar.checkPublicKey(publicKey);
        if (!exists) {
            throw new HttpException(
                'Wallet does not exist in blockchain',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Генерируем уникальный verification код
        const verificationCode = this.generateVerificationCode();

        // Получаем адрес для отправки из настроек
        const settings = await this.prisma.settings.findFirst();
        const depositAddress = settings?.depositAddress;

        if (!depositAddress) {
            throw new HttpException(
                'Deposit address not configured',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // Создаём временную запись (неактивную) с кодом
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 минут на верификацию

        const wallet = await this.prisma.wallet.create({
            data: {
                userId,
                publicKey,
                isActive: false,
                verificationStatus: 'PENDING',
                verificationExpiresAt: expiresAt,
                verificationAttempts: 0,
                metadata: {
                    verificationCode, // Сохраняем код
                    verified: false,
                },
            },
        });

        return {
            success: true,
            needsVerification: true,
            verificationCode,
            depositAddress, // Куда отправлять
            minAmount: 1, // Минимальная сумма XLM
            message: `Send at least 1 XLM to ${depositAddress} with memo: ${verificationCode}. You have 15 minutes.`,
            wallet: {
                id: wallet.id,
                publicKey: wallet.publicKey,
                verificationStatus: 'PENDING',
            },
            expiresAt,
        };
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

        // ✅ Платёж получен! Деактивируем все кошельки и активируем этот
        await this.prisma.wallet.updateMany({
            where: { userId },
            data: { isActive: false },
        });

        await this.prisma.wallet.update({
            where: { id: walletId },
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

        return {
            success: true,
            verified: true,
            verificationStatus: 'SUCCESS',
            message: 'Wallet verified successfully!',
        };
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

        // Деактивируем все кошельки пользователя
        await this.prisma.wallet.updateMany({
            where: {
                userId,
                isDeleted: false,
            },
            data: { isActive: false },
        });

        // Активируем выбранный кошелек
        await this.prisma.wallet.update({
            where: { id: walletId },
            data: { isActive: true },
        });

        return {
            success: true,
            message: 'Wallet activated successfully',
        };
    }
}
