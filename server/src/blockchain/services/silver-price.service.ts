import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SilverPriceData {
    timestamp: number;
    metal: string;
    currency: string;
    exchange: string;
    symbol: string;
    prev_close_price: number;
    open_price: number;
    low_price: number;
    high_price: number;
    open_time: number;
    price: number;
    ch: number;
    chp: number;
    ask: number;
    bid: number;
}

@Injectable()
export class SilverPriceService {
    private readonly logger = new Logger(SilverPriceService.name);
    private cachedPrice: SilverPriceData | null = null;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

    constructor(private readonly configService: ConfigService) { }

    async getSilverPrice(): Promise<SilverPriceData> {
        const now = Date.now();

        // Return cached price if still valid
        if (this.cachedPrice && (now - this.lastFetchTime) < this.CACHE_DURATION_MS) {
            return this.cachedPrice;
        }

        try {
            const apiToken = this.configService.get<string>('GOLDAPI_TOKEN', 'goldapi-1eaq7dsmjd03d7n-io');
            const response = await fetch('https://www.goldapi.io/api/XAG/USD', {
                method: 'GET',
                headers: {
                    'x-access-token': apiToken,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch silver price: ${response.status} ${response.statusText}`);
            }

            const data: SilverPriceData = await response.json();
            this.cachedPrice = data;
            this.lastFetchTime = now;

            this.logger.log(`Silver price updated: $${data.price}/oz (${data.chp > 0 ? '+' : ''}${data.chp}%)`);
            return data;
        } catch (error) {
            this.logger.error('Failed to fetch silver price', error);

            // Return cached price if available, even if expired
            if (this.cachedPrice) {
                this.logger.warn('Using expired cached silver price');
                return this.cachedPrice;
            }

            // Fallback to a default price if no cache available
            this.logger.warn('Using fallback silver price');
            return {
                timestamp: Math.floor(Date.now() / 1000),
                metal: 'XAG',
                currency: 'USD',
                exchange: 'FOREXCOM',
                symbol: 'FOREXCOM:XAGUSD',
                prev_close_price: 30.0,
                open_price: 30.0,
                low_price: 30.0,
                high_price: 30.0,
                open_time: Math.floor(Date.now() / 1000),
                price: 30.0,
                ch: 0,
                chp: 0,
                ask: 30.0,
                bid: 30.0,
            };
        }
    }

    async getCurrentPrice(): Promise<number> {
        const data = await this.getSilverPrice();
        return data.price;
    }

    async getPriceChange24h(): Promise<number> {
        const data = await this.getSilverPrice();
        return data.chp;
    }
}
