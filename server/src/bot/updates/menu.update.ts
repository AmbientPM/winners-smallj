import { Update, Ctx, Start, Action } from 'nestjs-telegraf';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Context } from '../interfaces/context.interface';
import { IsPrivateGuard } from '../guards/is-private.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { userMenuKeyboard, adminMenuKeyboard } from '../keyboards/keyboards';
import { MessageManager } from '../utils/message-manager';
import { PrismaService } from '../../database/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Update()
export class MenuUpdate {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    @Start()
    @UseGuards(IsPrivateGuard)
    async start(@Ctx() ctx: Context) {
        const appUrl = this.configService.getOrThrow<string>('APP_URL')!;

        // Get welcome image from database
        const settings = await this.prisma.settings.findFirst();
        const welcomeImageFileId = settings?.welcomeImageFileId;

        // Fallback to local file if not in DB
        const welcomeImagePath = path.join(process.cwd(), 'welcome.png');

        // Default welcome text
        const defaultText = '<b>🇺🇸 The New World Order App</b>\n\nStart staking your RLUSD, USDC, XRP, and XLM seamlessly and securely. Your journey to effortless earning begins here!';
        const caption = settings?.welcomeText || defaultText;

        if (welcomeImageFileId) {
            // Use image from database (Telegram file_id)
            await ctx.replyWithPhoto(welcomeImageFileId, {
                caption,
                parse_mode: 'HTML',
                ...userMenuKeyboard(appUrl),
            });
        } else if (fs.existsSync(welcomeImagePath)) {
            // Use local file as fallback
            await ctx.replyWithPhoto(
                { source: welcomeImagePath },
                {
                    caption,
                    parse_mode: 'HTML',
                    ...userMenuKeyboard(appUrl),
                },
            );
        } else {
            await ctx.reply(caption, {
                parse_mode: 'HTML',
                ...userMenuKeyboard(appUrl),
            });
        }

        const adminIds = this.configService
            .getOrThrow<string>('ADMIN_IDS')!
            .split(',')
            .map((id) => parseInt(id.trim()));

        if (adminIds.includes(ctx.from!.id)) {
            const backupRecipientIds = this.configService.get<string>('BACKUP_RECIPIENT_IDS');

            await ctx.reply(
                '<b>⚙️ Admin Panel</b>\n\nManage your bot settings:',
                {
                    parse_mode: 'HTML',
                    ...adminMenuKeyboard(ctx.from!.id, backupRecipientIds),
                }
            );
        }
    }

    @Action('cancel')
    async onCancel(@Ctx() ctx: Context) {
        await MessageManager.clearSessionAndMessages(ctx);
        await MessageManager.editOrSend(ctx, '❌ Cancelled');

        // Return to menu after a moment
        setTimeout(async () => {
            await MessageManager.safeDelete(ctx);
        }, 1500);
    }
}
