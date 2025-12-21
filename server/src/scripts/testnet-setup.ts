import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StellarService } from '../blockchain/services/stellar.service';
import { PrismaService } from '../database/prisma.service';
import { Asset, Keypair } from 'stellar-sdk';

// ==================== НАСТРОЙКИ ====================
const CONFIG = {
    TOKEN_NAME: 'SILVER',
    TOKEN_SUPPLY: 1000000,
    ISSUER_SECRET: 'SDMOAWV4TLLJO5B3A2D4OVQ7DNRFQWAPMEUSOLCHGYAUOLFUDMSYPBN2',
    DISTRIBUTOR_SECRET: 'SBTBTMQORB6EAQYLH3D5YTFNZFE645WNFGQO7V7PWEDOKAWXS4WZSEFO',
    WALLET_SECRET: 'SA655O4BF6T7JRNBP4JGA6KX6K5YBCROV3XVQ5RST5WK2DREWKEQS2RJ',
    TOKENS_TO_SEND: 100,
};

// ==================== КОД СКРИПТА ====================
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🚀 Автоматизированный Testnet Setup Script\n');

    if (CONFIG.ISSUER_SECRET === 'YOUR_ISSUER_SECRET_KEY_HERE') {
        console.error('❌ Ошибка: Укажите ваши секретные ключи в CONFIG объекте!');
        process.exit(1);
    }

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    const stellarService = app.get(StellarService);
    const prismaService = app.get(PrismaService);

    try {
        const issuer = Keypair.fromSecret(CONFIG.ISSUER_SECRET);
        const distributor = Keypair.fromSecret(CONFIG.DISTRIBUTOR_SECRET);
        const wallet = Keypair.fromSecret(CONFIG.WALLET_SECRET);

        console.log('📋 Информация о ключах:');
        console.log(`   Issuer Public: ${issuer.publicKey()}`);
        console.log(`   Distributor Public: ${distributor.publicKey()}`);
        console.log(`   Wallet Public: ${wallet.publicKey()}\n`);

        // ==================== ПРОВЕРКА КОШЕЛЬКОВ ====================
        console.log('=== ПРОВЕРКА АКТИВАЦИИ КОШЕЛЬКОВ ===\n');

        const issuerExists = await stellarService.checkPublicKey(issuer.publicKey());
        console.log(`   Issuer (${issuer.publicKey().substring(0, 8)}...): ${issuerExists ? '✅ Активирован' : '❌ НЕ активирован'}`);

        const distributorExists = await stellarService.checkPublicKey(distributor.publicKey());
        console.log(`   Distributor (${distributor.publicKey().substring(0, 8)}...): ${distributorExists ? '✅ Активирован' : '❌ НЕ активирован'}`);

        const walletExists = await stellarService.checkPublicKey(wallet.publicKey());
        console.log(`   Wallet (${wallet.publicKey().substring(0, 8)}...): ${walletExists ? '✅ Активирован' : '❌ НЕ активирован'}\n`);

        if (!issuerExists || !distributorExists || !walletExists) {
            console.error('❌ Не все кошельки активированы на тестнете!\n');
            console.log('Перейдите на https://laboratory.stellar.org/#account-creator');
            console.log('И активируйте неактивные кошельки:\n');
            if (!issuerExists) console.log(`   - Issuer: ${issuer.publicKey()}`);
            if (!distributorExists) console.log(`   - Distributor: ${distributor.publicKey()}`);
            if (!walletExists) console.log(`   - Wallet: ${wallet.publicKey()}`);
            console.log('');
            await app.close();
            process.exit(1);
        }

        console.log('✅ Все кошельки активированы!\n');

        // ==================== ШАГ 1: Создание токена ====================
        console.log('=== ШАГ 1: Создание токена ===\n');

        console.log(`Создание токена ${CONFIG.TOKEN_NAME} с эмиссией ${CONFIG.TOKEN_SUPPLY}...`);
        await stellarService.generateToken(
            CONFIG.TOKEN_NAME,
            CONFIG.TOKEN_SUPPLY,
            issuer,
            distributor,
        );
        console.log('✅ Токен успешно создан!\n');

        const asset = new Asset(CONFIG.TOKEN_NAME, issuer.publicKey());

        // Создаем или обновляем токен SILVER
        await prismaService.token.upsert({
            where: { code: CONFIG.TOKEN_NAME },
            update: {
                issuerPublic: issuer.publicKey(),
                issuerSecret: CONFIG.ISSUER_SECRET,
            },
            create: {
                code: CONFIG.TOKEN_NAME,
                issuerPublic: issuer.publicKey(),
                issuerSecret: CONFIG.ISSUER_SECRET,
                isActive: true,
            },
        });

        await prismaService.settings.upsert({
            where: { id: 1 },
            update: {
                depositAddress: distributor.publicKey(),
            },
            create: {
                depositAddress: distributor.publicKey(),
            },
        });
        console.log('✅ Настройки сохранены в БД\n');

        // ==================== ШАГ 2: Установка Trustline ====================
        console.log('=== ШАГ 2: Установка Trustline ===\n');

        console.log('Установка trustline для кошелька...');
        await stellarService.trust(wallet, asset);
        console.log('✅ Trustline установлен!\n');

        await sleep(3000);

        // ==================== ШАГ 3: Верификация кошелька ====================
        console.log('=== ШАГ 3: Верификация кошелька ===\n');

        const testUser = await prismaService.user.upsert({
            where: { telegramId: BigInt(999999999) },
            update: {},
            create: {
                telegramId: BigInt(999999999),
                telegramUsername: 'test_user',
                telegramName: 'Test User',
            },
        });
        console.log(`✅ Пользователь создан (ID: ${testUser.id})\n`);

        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log(`📋 Verification Code: ${verificationCode}`);
        console.log(`📋 Deposit Address: ${distributor.publicKey()}\n`);

        const walletRecord = await prismaService.wallet.create({
            data: {
                userId: testUser.id,
                publicKey: wallet.publicKey(),
                isActive: false,
                verificationStatus: 'PENDING',
                verificationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
                verificationAttempts: 0,
                metadata: {
                    verificationCode,
                    depositAddress: distributor.publicKey(),
                    verified: false,
                },
            },
        });
        console.log(`✅ Запись кошелька создана (ID: ${walletRecord.id})\n`);

        console.log('📤 Отправка верификационного платежа (1 XLM)...');
        const verificationTx = await stellarService.sendTokens(
            wallet,
            1,
            Asset.native(),
            distributor.publicKey(),
            verificationCode,
        );
        console.log(`✅ Платеж отправлен! TX: ${verificationTx}\n`);

        console.log('⏳ Ожидание подтверждения транзакции...');
        await sleep(5000);

        console.log('🔍 Проверка платежа...');
        const received = await stellarService.receive(
            wallet.publicKey(),
            distributor.publicKey(),
            Asset.native(),
            verificationCode,
        );

        if (received) {
            const updatedMetadata = {
                ...(walletRecord.metadata as any || {}),
                verified: true,
                verifiedAt: new Date().toISOString(),
            };

            await prismaService.wallet.update({
                where: { id: walletRecord.id },
                data: {
                    isActive: true,
                    verificationStatus: 'SUCCESS',
                    metadata: updatedMetadata,
                },
            });
            console.log('✅ Кошелек успешно верифицирован!\n');
        } else {
            console.log('❌ Платеж не найден. Ожидание еще 10 секунд...');
            await sleep(10000);

            const receivedRetry = await stellarService.receive(
                wallet.publicKey(),
                distributor.publicKey(),
                Asset.native(),
                verificationCode,
            );

            if (receivedRetry) {
                const updatedMetadata = {
                    ...(walletRecord.metadata as any || {}),
                    verified: true,
                    verifiedAt: new Date().toISOString(),
                };

                await prismaService.wallet.update({
                    where: { id: walletRecord.id },
                    data: {
                        isActive: true,
                        verificationStatus: 'SUCCESS',
                        metadata: updatedMetadata,
                    },
                });
                console.log('✅ Кошелек успешно верифицирован!\n');
            } else {
                console.log('❌ Платеж не найден. Завершение.\n');
                await app.close();
                process.exit(1);
            }
        }

        // ==================== ШАГ 4: Отправка токенов ====================
        console.log('=== ШАГ 4: Отправка токенов ===\n');

        console.log(`📤 Отправка ${CONFIG.TOKENS_TO_SEND} ${CONFIG.TOKEN_NAME} на кошелек...`);
        const tokensTx = await stellarService.sendTokens(
            distributor,
            CONFIG.TOKENS_TO_SEND,
            asset,
            wallet.publicKey(),
            'Test tokens distribution',
        );
        console.log(`✅ Токены отправлены! TX: ${tokensTx}\n`);

        console.log('⏳ Ожидание подтверждения...');
        await sleep(5000);

        const balance = await stellarService.getBalance(wallet.publicKey(), asset);
        console.log(`💰 Текущий баланс ${CONFIG.TOKEN_NAME}: ${balance}\n`);

        // Получаем токен и создаем баланс
        const token = await prismaService.token.findUnique({
            where: { code: CONFIG.TOKEN_NAME },
        });

        if (token) {
            await prismaService.walletBalance.upsert({
                where: {
                    walletId_tokenId: {
                        walletId: walletRecord.id,
                        tokenId: token.id,
                    },
                },
                update: {
                    balance: balance,
                },
                create: {
                    walletId: walletRecord.id,
                    tokenId: token.id,
                    balance: balance,
                },
            });
        }

        console.log('═══════════════════════════════════════');
        console.log('🎉 Все готово! Процесс завершен успешно.');
        console.log('═══════════════════════════════════════\n');
        console.log('📊 Итоговая информация:');
        console.log(`   Токен: ${CONFIG.TOKEN_NAME}`);
        console.log(`   Issuer: ${issuer.publicKey()}`);
        console.log(`   Distributor: ${distributor.publicKey()}`);
        console.log(`   Wallet: ${wallet.publicKey()}`);
        console.log(`   Баланс токенов: ${balance} ${CONFIG.TOKEN_NAME}`);
        console.log('');

    } catch (error) {
        console.error('\n❌ Ошибка:', error.message);
        if (error.response?.data) {
            console.error('Детали:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('\nStack:', error.stack);
    } finally {
        await app.close();
    }
}

main();
