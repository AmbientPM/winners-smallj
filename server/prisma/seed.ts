import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create tokens first
    const silverToken = await prisma.token.upsert({
        where: { code: 'SILVER' },
        update: {},
        create: {
            code: 'SILVER',
            issuerPublic: 'GBQAV7QSBJHWVYPP5OHINHA2SSTNI7DN4QI2JSSZ6ZYE3QECGF576TNQ',
            issuerSecret: 'SBAXEOQ5VYTMZ52MQ2YDAFFHYZ6SR7HBBJTU6ICAAZRZUMKHVPUUBCUI',
            isActive: true,
            buyLink: 'https://example.com/buy/silver',
        },
    });
    console.log('✅ Silver token created:', silverToken);

    const goldToken = await prisma.token.upsert({
        where: { code: 'GOLD' },
        update: {},
        create: {
            code: 'GOLD',
            issuerPublic: 'GBQAV7QSBJHWVYPP5OHINHA2SSTNI7DN4QI2JSSZ6ZYE3QECGF576TNQ',
            issuerSecret: 'SBAXEOQ5VYTMZ52MQ2YDAFFHYZ6SR7HBBJTU6ICAAZRZUMKHVPUUBCUI',
            isActive: true,
            buyLink: 'https://example.com/buy/gold',
        },
    });
    console.log('✅ Gold token created:', goldToken);

    // Create token prices
    await prisma.tokenPrice.create({
        data: {
            tokenId: silverToken.id,
            price: 30.0,
        },
    });
    console.log('✅ Silver price created');

    await prisma.tokenPrice.create({
        data: {
            tokenId: goldToken.id,
            price: 2700.0,
        },
    });
    console.log('✅ Gold price created');

    // Create mock user
    const mockUser = await prisma.user.upsert({
        where: { telegramId: BigInt(999999999) },
        update: {},
        create: {
            telegramId: BigInt(999999999),
            telegramUsername: 'mock_user',
            telegramName: 'Mock User',
        },
    });
    console.log('✅ Mock user created:', mockUser);

    // Create test users
    const testUser1 = await prisma.user.upsert({
        where: { telegramId: BigInt(111111111) },
        update: {},
        create: {
            telegramId: BigInt(111111111),
            telegramUsername: 'test_user1',
            telegramName: 'Test User 1',
        },
    });
    console.log('✅ Test user 1 created:', testUser1);

    const testUser2 = await prisma.user.upsert({
        where: { telegramId: BigInt(222222222) },
        update: {},
        create: {
            telegramId: BigInt(222222222),
            telegramUsername: 'test_user2',
            telegramName: 'Test User 2',
        },
    });
    console.log('✅ Test user 2 created:', testUser2);

    // Create wallets for mock user
    const wallet1 = await prisma.wallet.upsert({
        where: { publicKey: 'GB5JRPP2FDUDMUSQAQPBN345NFBWRGODPSASETSQ2EUWXB4XE5AEVWGV' },
        update: {},
        create: {
            userId: mockUser.id,
            publicKey: 'GB5JRPP2FDUDMUSQAQPBN345NFBWRGODPSASETSQ2EUWXB4XE5AEVWGV',
            isActive: true,
            verificationStatus: 'SUCCESS',
        },
    });
    console.log('✅ Wallet 1 created:', wallet1);

    // Create wallet balances for mock user
    await prisma.walletBalance.upsert({
        where: {
            walletId_tokenId: {
                walletId: wallet1.id,
                tokenId: silverToken.id,
            },
        },
        update: {},
        create: {
            walletId: wallet1.id,
            tokenId: silverToken.id,
            balance: 125.5,
        },
    });
    console.log('✅ Silver balance for wallet 1 created');

    await prisma.walletBalance.upsert({
        where: {
            walletId_tokenId: {
                walletId: wallet1.id,
                tokenId: goldToken.id,
            },
        },
        update: {},
        create: {
            walletId: wallet1.id,
            tokenId: goldToken.id,
            balance: 1.5,
        },
    });
    console.log('✅ Gold balance for wallet 1 created');

    // Create settings
    const settings = await prisma.settings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            depositAddress: 'GB5JRPP2FDUDMUSQAQPBN345NFBWRGODPSASETSQ2EUWXB4XE5AEVWGV',
            depositAmount: 10,
            sendingEnabled: true,
        },
    });
    console.log('✅ Settings created:', settings);

    // Create action logs
    const actionLog1 = await prisma.actionLog.create({
        data: {
            userId: mockUser.id,
            username: 'mock_user',
            fullName: 'Mock User',
            actionType: 'USER_REGISTERED',
            actionData: { source: 'seed' },
        },
    });
    console.log('✅ Action log 1 created:', actionLog1);

    const actionLog2 = await prisma.actionLog.create({
        data: {
            userId: mockUser.id,
            username: 'mock_user',
            fullName: 'Mock User',
            actionType: 'WALLET_ADDED',
            actionData: { publicKey: wallet1.publicKey },
        },
    });
    console.log('✅ Action log 2 created:', actionLog2);

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
