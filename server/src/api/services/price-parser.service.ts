import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';

interface GoldApiResponse {
    metal: string;
    currency: string;
    price: number;
    timestamp: number;
}

@Injectable()
export class PriceParserService {
    private readonly logger = new Logger(PriceParserService.name);
    private readonly apiToken = 'goldapi-1eaq7dsmjd03d7n-io';
    private readonly baseUrl = 'https://www.goldapi.io/api';

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Обновляет цены каждые 5 минут
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async updatePrices() {
        this.logger.log('Updating metal prices...');

        try {
            // Получаем токены
            const silverToken = await this.prisma.token.findUnique({
                where: { code: 'SILVER' },
            });
            const goldToken = await this.prisma.token.findUnique({
                where: { code: 'GOLD' },
            });

            if (!silverToken || !goldToken) {
                this.logger.error('Tokens not found in database');
                return;
            }

            // Получаем цены серебра и золота
            const [silverPrice, goldPrice] = await Promise.all([
                this.fetchPrice('XAG'), // Silver
                this.fetchPrice('XAU'), // Gold
            ]);

            // Сохраняем новые цены
            await Promise.all([
                this.prisma.tokenPrice.create({
                    data: {
                        tokenId: silverToken.id,
                        price: silverPrice,
                    },
                }),
                this.prisma.tokenPrice.create({
                    data: {
                        tokenId: goldToken.id,
                        price: goldPrice,
                    },
                }),
            ]);

            this.logger.log(
                `Prices updated successfully - Silver: $${silverPrice}, Gold: $${goldPrice}`,
            );
        } catch (error) {
            this.logger.error(`Error updating prices: ${error.message}`);
        }
    }

    /**
     * Запрос цены для конкретного металла
     */
    private async fetchPrice(metal: 'XAG' | 'XAU'): Promise<number> {
        try {
            const url = `${this.baseUrl}/${metal}/USD`;
            const response = await fetch(url, {
                headers: {
                    'x-access-token': this.apiToken,
                },
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data: GoldApiResponse = await response.json();

            if (!data.price) {
                throw new Error(`Invalid price data received for ${metal}`);
            }

            return data.price;
        } catch (error) {
            this.logger.error(`Error fetching ${metal} price: ${error.message}`);
            throw error;
        }
    }

    /**
     * Ручное обновление цен (можно вызвать из контроллера при необходимости)
     */
    async forceUpdate() {
        this.logger.log('Force updating prices...');
        await this.updatePrices();
    }
}
