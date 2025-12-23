import { Module, OnModuleInit } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { session } from 'telegraf';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

import { MenuUpdate } from './updates/menu.update';
import { TextHandlerUpdate } from './updates/text-handler.update';
import { AdminWelcomeImageUpdate } from './updates/admin/welcome-image.update';
import { AdminTokenManagementUpdate } from './updates/admin/token-management.update';
import { AdminDepositSettingsUpdate } from './updates/admin/deposit-settings.update';
import { AdminWelcomeTextUpdate } from './updates/admin/welcome-text.update';

import { IsAdminGuard } from './guards/is-admin.guard';
import { IsPrivateGuard } from './guards/is-private.guard';
import { UserMiddleware } from './middlewares/user.middleware';
import { ActionLoggingMiddleware } from './middlewares/action-logging.middleware';

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                token: configService.getOrThrow<string>('BOT_TOKEN')!,
                middlewares: [session()],
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        MenuUpdate,
        TextHandlerUpdate,
        AdminWelcomeImageUpdate,
        AdminTokenManagementUpdate,
        AdminDepositSettingsUpdate,
        AdminWelcomeTextUpdate,
        IsAdminGuard,
        IsPrivateGuard,
        UserMiddleware,
        ActionLoggingMiddleware,
    ],
})
export class BotModule implements OnModuleInit {
    constructor(
        @InjectBot() private readonly bot: Telegraf,
        private readonly userMiddleware: UserMiddleware,
        private readonly actionLoggingMiddleware: ActionLoggingMiddleware,
    ) { }

    onModuleInit() {
        // Register custom middlewares
        this.bot.use((ctx, next) => this.userMiddleware.use(ctx as any, next));
        this.bot.use((ctx, next) => this.actionLoggingMiddleware.use(ctx as any, next));

        // Add error handler
        this.bot.catch((err, ctx) => {
            console.error(`Error for ${ctx.updateType}:`, err);
        });

        console.log('Bot initialized successfully');
    }
}
