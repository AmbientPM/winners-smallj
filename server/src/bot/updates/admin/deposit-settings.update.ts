import { Update, Ctx, Action } from 'nestjs-telegraf';
import { UseGuards } from '@nestjs/common';
import { Markup } from 'telegraf';
import type { Context } from '../../interfaces/context.interface';
import { IsPrivateGuard } from '../../guards/is-private.guard';
import { IsAdminGuard } from '../../guards/is-admin.guard';
import { PrismaService } from '../../../database/prisma.service';
import { MessageManager } from '../../utils/message-manager';
import { cancelKeyboard } from '../../keyboards/keyboards';

@Update()
@UseGuards(IsPrivateGuard, IsAdminGuard)
export class AdminDepositSettingsUpdate {
    constructor(private readonly prisma: PrismaService) { }

    @Action('deposit_settings')
    async depositSettings(@Ctx() ctx: Context) {
        const settings = await this.prisma.settings.findFirst();

        let message = '💰 <b>Deposit Settings</b>\n\n';

        message += `<b>Deposit Address:</b>\n`;
        if (settings?.depositAddress) {
            message += `<code>${settings.depositAddress}</code>\n\n`;
        } else {
            message += `❌ Not set\n\n`;
        }

        message += `<b>Deposit Amount:</b>\n`;
        if (settings?.depositAmount) {
            message += `${settings.depositAmount} XLM\n\n`;
        } else {
            message += `❌ Not set\n\n`;
        }

        message += '👇 <i>Choose an action:</i>';

        const buttons = [
            [Markup.button.callback('📍 Set Deposit Address', 'set_deposit_address')],
            [Markup.button.callback('💵 Set Deposit Amount', 'set_deposit_amount')],
            [Markup.button.callback('◀️ Back to Admin Menu', 'back_to_admin')],
        ];

        await MessageManager.editOrSend(ctx, message, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard(buttons),
        });
    }

    @Action('set_deposit_address')
    async setDepositAddress(@Ctx() ctx: Context) {
        ctx.session.step = 'deposit_address';

        const message = '📍 <b>Set Deposit Address</b>\n\n' +
            'Please send the Stellar public key for deposits.\n\n' +
            '<i>Format: G... (56 characters)</i>';

        await MessageManager.sendAndRemember(ctx, message, {
            parse_mode: 'HTML',
            ...cancelKeyboard,
        });
        await ctx.answerCbQuery();
    }

    @Action('set_deposit_amount')
    async setDepositAmount(@Ctx() ctx: Context) {
        ctx.session.step = 'deposit_amount';

        const message = '💵 <b>Set Deposit Amount</b>\n\n' +
            'Please send the amount of XLM required for deposit verification.\n\n' +
            '<i>Example: 1.5 or 0.1</i>';

        await MessageManager.sendAndRemember(ctx, message, {
            parse_mode: 'HTML',
            ...cancelKeyboard,
        });
        await ctx.answerCbQuery();
    }

    // Text input handlers
    async handleDepositAddress(@Ctx() ctx: Context, text: string) {
        const address = text.trim();

        // Basic Stellar address validation
        if (!address.startsWith('G') || address.length !== 56) {
            await ctx.reply(
                '❌ Invalid Stellar address format.\n\nPlease send a valid public key starting with G (56 characters).',
                cancelKeyboard,
            );
            return;
        }

        try {
            await this.prisma.settings.upsert({
                where: { id: 1 },
                update: { depositAddress: address },
                create: { id: 1, depositAddress: address },
            });

            await MessageManager.deleteRemembered(ctx);
            ctx.session = {};

            await ctx.reply(
                `✅ <b>Deposit address updated!</b>\n\n<code>${address}</code>`,
                { parse_mode: 'HTML' },
            );
        } catch (error) {
            await ctx.reply(
                error instanceof Error ? error.message : 'Failed to update deposit address',
                cancelKeyboard,
            );
        }
    }

    async handleDepositAmount(@Ctx() ctx: Context, text: string) {
        const amount = parseFloat(text.trim());

        if (isNaN(amount) || amount <= 0) {
            await ctx.reply(
                '❌ Invalid amount.\n\nPlease send a valid positive number.',
                cancelKeyboard,
            );
            return;
        }

        try {
            await this.prisma.settings.upsert({
                where: { id: 1 },
                update: { depositAmount: amount },
                create: { id: 1, depositAmount: amount },
            });

            await MessageManager.deleteRemembered(ctx);
            ctx.session = {};

            await ctx.reply(
                `✅ <b>Deposit amount updated!</b>\n\n${amount} XLM`,
                { parse_mode: 'HTML' },
            );
        } catch (error) {
            await ctx.reply(
                error instanceof Error ? error.message : 'Failed to update deposit amount',
                cancelKeyboard,
            );
        }
    }
}
