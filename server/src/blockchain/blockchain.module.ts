import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StellarService } from './services/stellar.service';
import { StakingService } from './services/staking.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [ConfigModule, DatabaseModule],
    providers: [
        StellarService,
        StakingService,
    ],
    exports: [
        StellarService,
        StakingService,
    ],
})
export class BlockchainModule { }
