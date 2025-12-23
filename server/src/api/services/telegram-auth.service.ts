import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';

export interface TelegramUser {
    id: bigint;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

@Injectable()
export class TelegramAuthService {
    private readonly isDev: boolean;

    constructor(
        private readonly botToken: string,
        private readonly prisma: PrismaService,
    ) {
        this.isDev = process.env.IS_DEV === 'true';
    }

    async validateAndGetUser(initData?: string | null) {
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

        const telegramUser = this.validateInitData(initData);

        if (!telegramUser) {
            throw new HttpException('Invalid authentication', HttpStatus.UNAUTHORIZED);
        }

        let user = await this.prisma.user.findUnique({
            where: { telegramId: telegramUser.id },
        });

        if (!user) {
            // Auto-create user if not exists
            user = await this.prisma.user.create({
                data: {
                    telegramId: telegramUser.id,
                    telegramUsername: telegramUser.username || null,
                    telegramName: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || 'Unknown',
                },
            });
        }

        return user;
    }

    validateInitData(initData: string): TelegramUser | null {
        try {
            const urlParams = new URLSearchParams(initData);
            const hash = urlParams.get('hash');
            urlParams.delete('hash');

            // Create data check string
            const dataCheckArr: string[] = [];
            for (const [key, value] of urlParams.entries()) {
                dataCheckArr.push(`${key}=${value}`);
            }
            dataCheckArr.sort();
            const dataCheckString = dataCheckArr.join('\n');

            // Generate secret key
            const secretKey = crypto
                .createHmac('sha256', 'WebAppData')
                .update(this.botToken)
                .digest();

            // Generate hash
            const calculatedHash = crypto
                .createHmac('sha256', secretKey)
                .update(dataCheckString)
                .digest('hex');

            if (calculatedHash !== hash) {
                return null;
            }

            // Parse user data
            const userParam = urlParams.get('user');
            if (!userParam) {
                return null;
            }

            const userData = JSON.parse(userParam);
            const user: TelegramUser = {
                ...userData,
                id: BigInt(userData.id),
            };
            return user;
        } catch (error) {
            console.error('Telegram auth validation error:', error);
            return null;
        }
    }
}
