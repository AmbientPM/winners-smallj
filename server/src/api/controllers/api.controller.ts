import {
    Controller,
    Post,
    Body,
    ValidationPipe,
} from '@nestjs/common';
import { TelegramAuthService } from '../services/telegram-auth.service';
import { UserService } from '../services/user.service';
import { WalletService } from '../services/wallet/wallet.service';

import { UserStatisticsDto } from '../dto/user-statistics.dto';
import { AddWalletDto, VerifyWalletDto, DeleteWalletDto, SetActiveWalletDto } from '../dto/wallet.dto';

@Controller('api')
export class ApiController {
    constructor(
        private readonly telegramAuth: TelegramAuthService,
        private readonly userService: UserService,
        private readonly walletService: WalletService,
    ) { }

    @Post('/userStatistics')
    async userStatistics(@Body(ValidationPipe) body: UserStatisticsDto) {
        const user = await this.telegramAuth.validateAndGetUser(body.initData);
        return this.userService.getUserStatistics(user.id);
    }

    @Post('/addWallet')
    async addWallet(@Body(ValidationPipe) body: AddWalletDto) {
        const user = await this.telegramAuth.validateAndGetUser(body.initData);
        return this.walletService.addWallet(user.id, body.publicKey);
    }

    @Post('/verifyWallet')
    async verifyWallet(@Body(ValidationPipe) body: VerifyWalletDto) {
        const user = await this.telegramAuth.validateAndGetUser(body.initData);
        return this.walletService.verifyWallet(user.id, body.walletId);
    }

    @Post('/deleteWallet')
    async deleteWallet(@Body(ValidationPipe) body: DeleteWalletDto) {
        const user = await this.telegramAuth.validateAndGetUser(body.initData);
        return this.walletService.deleteWallet(user.id, body.walletId);
    }

    @Post('/setActiveWallet')
    async setActiveWallet(@Body(ValidationPipe) body: SetActiveWalletDto) {
        const user = await this.telegramAuth.validateAndGetUser(body.initData);
        return this.walletService.setActiveWallet(user.id, body.walletId);
    }






}
