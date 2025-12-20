import {
    Controller,
    Post,
    Body,
    HttpException,
    HttpStatus,
    ValidationPipe,
    Get,
} from '@nestjs/common';
import { TelegramAuthService } from '../services/telegram-auth.service';
import { UserService } from '../services/user.service';
import { WalletService } from '../services/wallet.service';
import { UserStatisticsDto } from '../dto/user-statistics.dto';
import { AddWalletDto, VerifyWalletDto, DeleteWalletDto } from '../dto/wallet.dto';
import { PrismaService } from '../../database/prisma.service';

@Controller()
export class ApiController {
    private readonly isDev: boolean;

    constructor(
        private readonly prisma: PrismaService,
        private readonly telegramAuth: TelegramAuthService,
        private readonly userService: UserService,
        private readonly walletService: WalletService,
    ) {
        this.isDev = process.env.IS_DEV === 'true';
    }

    private async validateAndGetUser(initData?: string) {
        // Dev mode: return mock user if initData is not provided
        if (this.isDev && (!initData || initData.trim() === '')) {
            let mockUser = await this.prisma.user.findFirst({
                where: { telegramId: BigInt(999999999) },
            });

            if (!mockUser) {
                mockUser = await this.prisma.user.create({
                    data: {
                        telegramId: BigInt(999999999),
                        telegramUsername: 'mock_user',
                        telegramName: 'Mock User',
                    },
                });
            }

            return mockUser;
        }

        if (!initData) {
            throw new HttpException('Invalid authentication', HttpStatus.UNAUTHORIZED);
        }

        const telegramUser = this.telegramAuth.validateInitData(initData);

        if (!telegramUser) {
            throw new HttpException('Invalid authentication', HttpStatus.UNAUTHORIZED);
        }

        const user = await this.prisma.user.findUnique({
            where: { telegramId: telegramUser.id },
        });

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return user;
    }

    @Get('/userStatistics')
    async userStatistics(@Body(ValidationPipe) body: UserStatisticsDto) {
        const user = await this.validateAndGetUser(body.initData);
        return this.userService.getUserStatistics(user.id);
    }

    @Post('/addWallet')
    async addWallet(@Body(ValidationPipe) body: AddWalletDto) {
        const user = await this.validateAndGetUser(body.initData);
        return this.walletService.addWallet(user.id, body.publicKey);
    }

    @Post('/verifyWallet')
    async verifyWallet(@Body(ValidationPipe) body: VerifyWalletDto) {
        const user = await this.validateAndGetUser(body.initData);
        return this.walletService.verifyWallet(user.id, body.walletId);
    }

    @Post('/deleteWallet')
    async deleteWallet(@Body(ValidationPipe) body: DeleteWalletDto) {
        const user = await this.validateAndGetUser(body.initData);
        return this.walletService.deleteWallet(user.id, body.walletId);
    }
}
