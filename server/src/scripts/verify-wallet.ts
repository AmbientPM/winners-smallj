import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StellarService } from '../blockchain/services/stellar.service';
import { Asset, Keypair } from 'stellar-sdk';

// ==================== НАСТРОЙКИ ====================
const CONFIG = {
    // Кошелек который верифицируем
    WALLET_PUBLIC: 'GDAGRCYKIHFDIE4TBUQBFJKN4CJZJVY3NEMTIP3FRDQOO2XT7G2T2ONR',
    WALLET_SECRET: 'SD43CPJWPRSZJOV6YPFPHZLU3AJOLJJFJ4DJNSR3NBM4J32DVMAGDGRA',
    
    // Адрес куда отправлять
    DEPOSIT_ADDRESS: 'GB7QJF4D44OTW5YL3MUPX76K4L43B2EI47KS7G2N2MZTVGNX7B2Y6NDU',
    
    // Код верификации
    VERIFICATION_CODE: 'NWO809211843',
    
    // Сумма для отправки
    AMOUNT: 1,
};

// ==================== КОД СКРИПТА ====================
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🔐 Скрипт верификации кошелька\n');

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    const stellarService = app.get(StellarService);

    try {
        const wallet = Keypair.fromSecret(CONFIG.WALLET_SECRET);
        
        console.log('📋 Информация:');
        console.log(`   Кошелек: ${wallet.publicKey()}`);
        console.log(`   Deposit Address: ${CONFIG.DEPOSIT_ADDRESS}`);
        console.log(`   Verification Code: ${CONFIG.VERIFICATION_CODE}`);
        console.log(`   Сумма: ${CONFIG.AMOUNT} XLM\n`);

        // Проверка что кошелек активирован
        console.log('🔍 Проверка активации кошелька...');
        const walletExists = await stellarService.checkPublicKey(wallet.publicKey());
        
        if (!walletExists) {
            console.error(`❌ Кошелек ${wallet.publicKey()} не активирован на тестнете!`);
            console.log('\nПерейдите на https://laboratory.stellar.org/#account-creator');
            console.log(`И активируйте кошелек: ${wallet.publicKey()}\n`);
            await app.close();
            process.exit(1);
        }
        console.log('✅ Кошелек активирован!\n');

        // Проверка баланса
        console.log('💰 Проверка баланса...');
        const balance = await stellarService.getBalance(wallet.publicKey(), Asset.native());
        console.log(`   Текущий баланс: ${balance} XLM`);
        
        if (balance < CONFIG.AMOUNT) {
            console.error(`❌ Недостаточно средств! Требуется минимум ${CONFIG.AMOUNT} XLM`);
            console.log('\nПополните кошелек на https://laboratory.stellar.org/#account-creator\n');
            await app.close();
            process.exit(1);
        }
        console.log('✅ Баланс достаточен!\n');

        // Отправка верификационного платежа
        console.log('📤 Отправка верификационного платежа...');
        console.log(`   От: ${wallet.publicKey()}`);
        console.log(`   Кому: ${CONFIG.DEPOSIT_ADDRESS}`);
        console.log(`   Сумма: ${CONFIG.AMOUNT} XLM`);
        console.log(`   Memo: ${CONFIG.VERIFICATION_CODE}\n`);
        
        const txHash = await stellarService.sendTokens(
            wallet,
            CONFIG.AMOUNT,
            Asset.native(),
            CONFIG.DEPOSIT_ADDRESS,
            CONFIG.VERIFICATION_CODE,
        );
        
        console.log(`✅ Платеж отправлен!`);
        console.log(`   TX Hash: ${txHash}\n`);
        console.log(`   Просмотр: https://stellar.expert/explorer/testnet/tx/${txHash}\n`);

        // Ожидание подтверждения
        console.log('⏳ Ожидание подтверждения транзакции (5 секунд)...');
        await sleep(5000);

        // Проверка получения платежа
        console.log('🔍 Проверка получения платежа...');
        const received = await stellarService.receive(
            wallet.publicKey(),
            CONFIG.DEPOSIT_ADDRESS,
            Asset.native(),
            CONFIG.VERIFICATION_CODE,
            CONFIG.AMOUNT,
        );

        if (received) {
            console.log('✅ Платеж успешно подтвержден в блокчейне!\n');
            console.log('═══════════════════════════════════════');
            console.log('🎉 Верификация завершена успешно!');
            console.log('═══════════════════════════════════════\n');
            console.log('Теперь вы можете нажать "Verify Payment" в UI');
            console.log('или подождать автоматической проверки (каждую минуту)\n');
        } else {
            console.log('⚠️  Платеж пока не подтвержден. Ожидание еще 10 секунд...');
            await sleep(10000);

            const receivedRetry = await stellarService.receive(
                wallet.publicKey(),
                CONFIG.DEPOSIT_ADDRESS,
                Asset.native(),
                CONFIG.VERIFICATION_CODE,
                CONFIG.AMOUNT,
            );

            if (receivedRetry) {
                console.log('✅ Платеж успешно подтвержден в блокчейне!\n');
                console.log('═══════════════════════════════════════');
                console.log('🎉 Верификация завершена успешно!');
                console.log('═══════════════════════════════════════\n');
                console.log('Теперь вы можете нажать "Verify Payment" в UI\n');
            } else {
                console.log('❌ Платеж все еще не подтвержден.');
                console.log('   Подождите немного и проверьте вручную через UI\n');
            }
        }

        // Проверка нового баланса
        const newBalance = await stellarService.getBalance(wallet.publicKey(), Asset.native());
        console.log(`💰 Новый баланс: ${newBalance} XLM`);
        console.log(`   Потрачено: ${(balance - newBalance).toFixed(7)} XLM (включая комиссию)\n`);

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
