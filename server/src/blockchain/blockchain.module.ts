import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StellarService } from './services/stellar.service';
import { SilverPriceService } from './services/silver-price.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [ConfigModule, DatabaseModule],
    providers: [
        StellarService,
        SilverPriceService,
    ],
    exports: [
        StellarService,
        SilverPriceService,
    ],
})
export class BlockchainModule { }
