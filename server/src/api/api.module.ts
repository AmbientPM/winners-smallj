import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiController } from './controllers/api.controller';
import { TelegramAuthService } from './services/telegram-auth.service';
import { UserService } from './services/user.service';
import { WalletService } from './services/wallet/wallet.service';
import { WalletVerificationService } from './services/wallet/wallet-verification.service';
import { PriceParserService } from './services/price-parser.service';

import { StatusGateway } from './gateways/status.gateway';
import { DatabaseModule } from '../database/database.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
    imports: [ConfigModule, DatabaseModule, BlockchainModule, ScheduleModule.forRoot()],
    controllers: [ApiController],
    providers: [
        {
            provide: TelegramAuthService,
            useFactory: (configService: ConfigService) => {
                const botToken = configService.get<string>('BOT_TOKEN')!;
                return new TelegramAuthService(botToken);
            },
            inject: [ConfigService],
        },
        UserService,
        WalletService,
        WalletVerificationService,
        PriceParserService,
        StatusGateway,
    ],
    exports: [TelegramAuthService, StatusGateway],
})
export class ApiModule { }
