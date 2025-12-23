import { Update, Ctx, Action } from 'nestjs-telegraf';
import { UseGuards } from '@nestjs/common';
import { Markup } from 'telegraf';
import type { Context } from '../../interfaces/context.interface';
import { IsPrivateGuard } from '../../guards/is-private.guard';
import { IsAdminGuard } from '../../guards/is-admin.guard';
import { PrismaService } from '../../../database/prisma.service';
import { MessageManager } from '../../utils/message-manager';
import { cancelKeyboard } from '../../keyboards/keyboards';

const DEFAULT_WELCOME_TEXT = '<b>🇺🇸 The New World Order App</b>\n\nStart staking your RLUSD, USDC, XRP, and XLM seamlessly and securely. Your journey to effortless earning begins here!';

@Update()
@UseGuards(IsPrivateGuard, IsAdminGuard)
export class AdminWelcomeTextUpdate {
    constructor(private readonly prisma: PrismaService) { }

    @Action('welcome_text_settings')
    async welcomeTextSettings(@Ctx() ctx: Context) {
        const settings = await this.prisma.settings.findFirst();
        const currentText = settings?.welcomeText || DEFAULT_WELCOME_TEXT;

        let message = '📝 <b>Welcome Text Settings</b>\n\n';
        message += '<b>Current text:</b>\n';
        message += '─────────────────\n';
        message += currentText + '\n';
        message += '─────────────────\n\n';

        if (!settings?.welcomeText) {
            message += '<i>⚠️ Using default text</i>\n\n';
        }

        message += '👇 <i>Choose an action:</i>';

        const buttons = [
            [Markup.button.callback('✏️ Edit Welcome Text', 'edit_welcome_text')],
            [Markup.button.callback('👁 Preview', 'preview_welcome_text')],
        ];

        if (settings?.welcomeText) {
            buttons.push([Markup.button.callback('🔄 Reset to Default', 'reset_welcome_text')]);
        }

        buttons.push([Markup.button.callback('◀️ Back to Admin Menu', 'back_to_admin')]);

        await MessageManager.editOrSend(ctx, message, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard(buttons),
        });
    }

    @Action('edit_welcome_text')
    async editWelcomeText(@Ctx() ctx: Context) {
        ctx.session.step = 'welcome_text';

        const settings = await this.prisma.settings.findFirst();
        const currentText = settings?.welcomeText || DEFAULT_WELCOME_TEXT;

        let message = '✏️ <b>Edit Welcome Text</b>\n\n';
        message += 'Send new welcome text. You can use HTML formatting:\n\n';
        message += '<code>&lt;b&gt;bold&lt;/b&gt;</code> → <b>bold</b>\n';
        message += '<code>&lt;i&gt;italic&lt;/i&gt;</code> → <i>italic</i>\n';
        message += '<code>&lt;u&gt;underline&lt;/u&gt;</code> → <u>underline</u>\n';
        message += '<code>&lt;code&gt;code&lt;/code&gt;</code> → <code>code</code>\n\n';
        message += '<b>Current text:</b>\n';
        message += '<code>' + this.escapeHtml(currentText) + '</code>';

        await MessageManager.sendAndRemember(ctx, message, {
            parse_mode: 'HTML',
            ...cancelKeyboard,
        });
        await ctx.answerCbQuery();
    }

    @Action('preview_welcome_text')
    async previewWelcomeText(@Ctx() ctx: Context) {
        const settings = await this.prisma.settings.findFirst();
        const text = settings?.welcomeText || DEFAULT_WELCOME_TEXT;

        await ctx.answerCbQuery();

        // Send preview
        if (settings?.welcomeImageFileId) {
            await ctx.replyWithPhoto(settings.welcomeImageFileId, {
                caption: text,
                parse_mode: 'HTML',
            });
        } else {
            await ctx.reply(text, { parse_mode: 'HTML' });
        }

        await ctx.reply('👆 <i>This is how the welcome message will look</i>', {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('◀️ Back', 'welcome_text_settings')],
            ]),
        });
    }

    @Action('reset_welcome_text')
    async resetWelcomeText(@Ctx() ctx: Context) {
        await this.prisma.settings.upsert({
            where: { id: 1 },
            update: { welcomeText: null },
            create: { id: 1 },
        });

        await ctx.answerCbQuery('✅ Reset to default', { show_alert: true });
        await this.welcomeTextSettings(ctx);
    }

    // Text input handler
    async handleWelcomeText(@Ctx() ctx: Context, text: string) {
        // Validate HTML by trying to send a test message
        try {
            // Try to send a test message to validate HTML
            const testMsg = await ctx.reply(text, { parse_mode: 'HTML' });
            await ctx.telegram.deleteMessage(ctx.chat!.id, testMsg.message_id);
        } catch (error: any) {
            if (error?.message?.includes('can\'t parse')) {
                await ctx.reply(
                    '❌ <b>Invalid HTML formatting</b>\n\nPlease check your HTML tags and try again.',
                    { parse_mode: 'HTML', ...cancelKeyboard },
                );
                return;
            }
        }

        try {
            await this.prisma.settings.upsert({
                where: { id: 1 },
                update: { welcomeText: text },
                create: { id: 1, welcomeText: text },
            });

            await MessageManager.deleteRemembered(ctx);
            ctx.session = {};

            await ctx.reply('✅ <b>Welcome text updated!</b>', { parse_mode: 'HTML' });

            // Show preview
            const settings = await this.prisma.settings.findFirst();
            if (settings?.welcomeImageFileId) {
                await ctx.replyWithPhoto(settings.welcomeImageFileId, {
                    caption: text,
                    parse_mode: 'HTML',
                });
            } else {
                await ctx.reply(text, { parse_mode: 'HTML' });
            }
        } catch (error) {
            await ctx.reply(
                error instanceof Error ? error.message : 'Failed to update welcome text',
                cancelKeyboard,
            );
        }
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

export { DEFAULT_WELCOME_TEXT };
