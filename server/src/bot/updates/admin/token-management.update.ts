import { Update, Ctx, Action } from 'nestjs-telegraf';
import { UseGuards } from '@nestjs/common';
import type { Context } from '../../interfaces/context.interface';
import { IsPrivateGuard } from '../../guards/is-private.guard';
import { IsAdminGuard } from '../../guards/is-admin.guard';
import { PrismaService } from '../../../database/prisma.service';
import { MessageManager } from '../../utils/message-manager';
import { Markup } from 'telegraf';

@Update()
@UseGuards(IsPrivateGuard, IsAdminGuard)
export class AdminTokenManagementUpdate {
    constructor(private readonly prisma: PrismaService) { }

    @Action('manage_tokens')
    async manageTokens(@Ctx() ctx: Context) {
        const tokens = await this.prisma.token.findMany({
            orderBy: { id: 'asc' },
        });

        let message = '🪙 <b>Token Management</b>\n\n';

        if (tokens.length === 0) {
            message += '❌ No tokens found.\n\n';
        } else {
            for (const token of tokens) {
                message += `<b>${token.code}</b>\n`;
                message += `  Status: ${token.isActive ? '✅ Active' : '❌ Inactive'}\n`;
                message += `  Issuer: ${token.issuerPublic ? `<code>${token.issuerPublic.substring(0, 10)}...</code>` : '❌ Not set'}\n`;
                message += `  Buy Link: ${token.buyLink ? '✅ Set' : '❌ Not set'}\n\n`;
            }
        }

        message += '👇 <i>Choose an action:</i>';

        const buttons: any[][] = [];

        // Add token buttons (2 per row)
        for (let i = 0; i < tokens.length; i += 2) {
            const row: any[] = [];
            row.push(Markup.button.callback(`✏️ ${tokens[i].code}`, `edit_token_${tokens[i].id}`));
            if (tokens[i + 1]) {
                row.push(Markup.button.callback(`✏️ ${tokens[i + 1].code}`, `edit_token_${tokens[i + 1].id}`));
            }
            buttons.push(row);
        }

        buttons.push([Markup.button.callback('➕ Add New Token', 'add_token')]);
        buttons.push([Markup.button.callback('◀️ Back to Admin Menu', 'back_to_admin')]);

        await MessageManager.editOrSend(ctx, message, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard(buttons),
        });
    }

    @Action('add_token')
    async addToken(@Ctx() ctx: Context) {
        ctx.session.step = 'add_token_code';
        ctx.session.data = { tokenData: {} };

        await MessageManager.editOrSend(
            ctx,
            '🪙 <b>Add New Token</b>\n\nPlease enter the token code (e.g., SILVER, GOLD, XRP):',
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('❌ Cancel', 'manage_tokens')],
                ]),
            }
        );
    }

    @Action(/^edit_token_(\d+)$/)
    async editToken(@Ctx() ctx: Context) {
        const tokenId = parseInt(ctx.match![1]);
        const token = await this.prisma.token.findUnique({
            where: { id: tokenId },
        });

        if (!token) {
            await ctx.answerCbQuery('❌ Token not found', { show_alert: true });
            return;
        }

        let message = `🪙 <b>Edit Token: ${token.code}</b>\n\n`;
        message += `<b>Current Settings:</b>\n`;
        message += `  Code: <code>${token.code}</code>\n`;
        message += `  Status: ${token.isActive ? '✅ Active' : '❌ Inactive'}\n`;
        message += `  Issuer Public: ${token.issuerPublic ? `<code>${token.issuerPublic}</code>` : '❌ Not set'}\n`;
        message += `  Issuer Secret: ${token.issuerSecret ? '✅ Set (hidden)' : '❌ Not set'}\n`;
        message += `  Buy Link: ${token.buyLink ? `<code>${token.buyLink}</code>` : '❌ Not set'}\n\n`;
        message += '👇 <i>What would you like to edit?</i>';

        const buttons = [
            [Markup.button.callback('📝 Edit Code', `edit_token_field_${tokenId}_code`)],
            [Markup.button.callback('🔑 Edit Issuer Keys', `edit_token_field_${tokenId}_issuer`)],
            [Markup.button.callback('🔗 Edit Buy Link', `edit_token_field_${tokenId}_buylink`)],
            [
                Markup.button.callback(
                    token.isActive ? '🔴 Deactivate' : '🟢 Activate',
                    `toggle_token_${tokenId}`
                ),
            ],
            [Markup.button.callback('🗑 Delete Token', `delete_token_${tokenId}`)],
            [Markup.button.callback('◀️ Back', 'manage_tokens')],
        ];

        await MessageManager.editOrSend(ctx, message, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard(buttons),
        });
    }

    @Action(/^edit_token_field_(\d+)_(code|issuer|buylink)$/)
    async editTokenField(@Ctx() ctx: Context) {
        const tokenId = parseInt(ctx.match![1]);
        const field = ctx.match![2];

        const token = await this.prisma.token.findUnique({
            where: { id: tokenId },
        });

        if (!token) {
            await ctx.answerCbQuery('❌ Token not found', { show_alert: true });
            return;
        }

        ctx.session.data = { tokenId, field };

        let message = '';
        let step = '';

        if (field === 'code') {
            step = 'edit_token_code';
            message = `🪙 <b>Edit Token Code</b>\n\nCurrent: <code>${token.code}</code>\n\nEnter new token code:`;
        } else if (field === 'issuer') {
            step = 'edit_token_issuer_public';
            message = `🔑 <b>Edit Issuer Public Key</b>\n\nCurrent: ${token.issuerPublic ? `<code>${token.issuerPublic}</code>` : '❌ Not set'}\n\nEnter new issuer public key:`;
        } else if (field === 'buylink') {
            step = 'edit_token_buylink';
            message = `🔗 <b>Edit Buy Link</b>\n\nCurrent: ${token.buyLink ? `<code>${token.buyLink}</code>` : '❌ Not set'}\n\nEnter new buy link (or send "remove" to clear):`;
        }

        ctx.session.step = step;

        await MessageManager.editOrSend(ctx, message, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('❌ Cancel', `edit_token_${tokenId}`)],
            ]),
        });
    }

    @Action(/^toggle_token_(\d+)$/)
    async toggleToken(@Ctx() ctx: Context) {
        const tokenId = parseInt(ctx.match![1]);

        const token = await this.prisma.token.update({
            where: { id: tokenId },
            data: { isActive: { set: undefined } },
            select: { isActive: true },
        });

        const updatedToken = await this.prisma.token.update({
            where: { id: tokenId },
            data: { isActive: !token.isActive },
        });

        await ctx.answerCbQuery(
            `✅ Token ${updatedToken.isActive ? 'activated' : 'deactivated'}`,
            { show_alert: true }
        );

        // Refresh the edit view
        ctx.match = [ctx.match![0], tokenId.toString()];
        await this.editToken(ctx);
    }

    @Action(/^delete_token_(\d+)$/)
    async deleteTokenConfirm(@Ctx() ctx: Context) {
        const tokenId = parseInt(ctx.match![1]);

        const token = await this.prisma.token.findUnique({
            where: { id: tokenId },
        });

        if (!token) {
            await ctx.answerCbQuery('❌ Token not found', { show_alert: true });
            return;
        }

        await MessageManager.editOrSend(
            ctx,
            `⚠️ <b>Delete Token</b>\n\n` +
            `Are you sure you want to delete token <b>${token.code}</b>?\n\n` +
            `This action cannot be undone!`,
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('✅ Yes, Delete', `confirm_delete_token_${tokenId}`)],
                    [Markup.button.callback('❌ Cancel', `edit_token_${tokenId}`)],
                ]),
            }
        );
    }

    @Action(/^confirm_delete_token_(\d+)$/)
    async deleteToken(@Ctx() ctx: Context) {
        const tokenId = parseInt(ctx.match![1]);

        try {
            await this.prisma.token.delete({
                where: { id: tokenId },
            });

            await ctx.answerCbQuery('✅ Token deleted successfully', { show_alert: true });
            await this.manageTokens(ctx);
        } catch (error) {
            await ctx.answerCbQuery('❌ Failed to delete token. It might be in use.', { show_alert: true });
        }
    }

    @Action('back_to_admin')
    async backToAdmin(@Ctx() ctx: Context) {
        await MessageManager.editOrSend(
            ctx,
            '<b>⚙️ Admin Panel</b>\n\nManage your bot settings:',
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('📸 Welcome Image', 'set_welcome_image')],
                    [Markup.button.callback('🪙 Manage Tokens', 'manage_tokens')],
                ]),
            }
        );
    }

    // Text input handlers
    async handleAddTokenCode(@Ctx() ctx: Context, text: string) {
        if (!ctx.session.data) ctx.session.data = {};
        if (!ctx.session.data.tokenData) ctx.session.data.tokenData = {};

        ctx.session.data.tokenData.code = text.toUpperCase().trim();
        ctx.session.step = 'add_token_issuer_public';

        await MessageManager.sendAndRemember(
            ctx,
            '🔑 <b>Issuer Public Key</b>\n\nEnter the issuer public key (or send "skip" to set later):',
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('⏭ Skip', 'skip_issuer_public')],
                    [Markup.button.callback('❌ Cancel', 'manage_tokens')],
                ]),
            }
        );
    }

    async handleAddTokenIssuerPublic(@Ctx() ctx: Context, text: string) {
        if (text.toLowerCase() !== 'skip') {
            ctx.session.data!.tokenData.issuerPublic = text.trim();
        }

        ctx.session.step = 'add_token_issuer_secret';

        await MessageManager.sendAndRemember(
            ctx,
            '🔐 <b>Issuer Secret Key</b>\n\nEnter the issuer secret key (or send "skip" to set later):',
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('⏭ Skip', 'skip_issuer_secret')],
                    [Markup.button.callback('❌ Cancel', 'manage_tokens')],
                ]),
            }
        );
    }

    async handleAddTokenIssuerSecret(@Ctx() ctx: Context, text: string) {
        if (text.toLowerCase() !== 'skip') {
            ctx.session.data!.tokenData.issuerSecret = text.trim();
        }

        ctx.session.step = 'add_token_buylink';

        await MessageManager.sendAndRemember(
            ctx,
            '🔗 <b>Buy Link</b>\n\nEnter the buy link URL (or send "skip" to set later):',
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('⏭ Skip', 'skip_buylink')],
                    [Markup.button.callback('❌ Cancel', 'manage_tokens')],
                ]),
            }
        );
    }

    async handleAddTokenBuyLink(@Ctx() ctx: Context, text: string) {
        if (text.toLowerCase() !== 'skip') {
            ctx.session.data!.tokenData.buyLink = text.trim();
        }

        // Create the token
        try {
            const token = await this.prisma.token.create({
                data: {
                    code: ctx.session.data!.tokenData.code,
                    issuerPublic: ctx.session.data!.tokenData.issuerPublic || null,
                    issuerSecret: ctx.session.data!.tokenData.issuerSecret || null,
                    buyLink: ctx.session.data!.tokenData.buyLink || null,
                    isActive: true,
                },
            });

            await MessageManager.deleteRemembered(ctx);
            ctx.session = {};

            await ctx.reply(
                `✅ <b>Token Created Successfully!</b>\n\n` +
                `Code: <code>${token.code}</code>\n` +
                `Status: ✅ Active`,
                {
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('🪙 Back to Tokens', 'manage_tokens')],
                    ]),
                }
            );
        } catch (error) {
            await ctx.reply(
                `❌ <b>Error Creating Token</b>\n\n` +
                `${error instanceof Error ? error.message : 'Unknown error'}`,
                {
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('🪙 Back to Tokens', 'manage_tokens')],
                    ]),
                }
            );
        }
    }

    async handleEditTokenCode(@Ctx() ctx: Context, text: string) {
        const tokenId = ctx.session.data!.tokenId;
        const newCode = text.toUpperCase().trim();

        try {
            await this.prisma.token.update({
                where: { id: tokenId },
                data: { code: newCode },
            });

            await MessageManager.deleteRemembered(ctx);
            ctx.session = {};

            await ctx.reply('✅ Token code updated successfully!', {
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('◀️ Back to Token', `edit_token_${tokenId}`)],
                ]),
            });
        } catch (error) {
            await ctx.reply(
                `❌ Failed to update token code: ${error instanceof Error ? error.message : 'Unknown error'}`,
                {
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('◀️ Back to Token', `edit_token_${tokenId}`)],
                    ]),
                }
            );
        }
    }

    async handleEditTokenIssuerPublic(@Ctx() ctx: Context, text: string) {
        const tokenId = ctx.session.data!.tokenId;

        ctx.session.data!.issuerPublic = text.trim();
        ctx.session.step = 'edit_token_issuer_secret';

        await MessageManager.sendAndRemember(
            ctx,
            '🔐 <b>Issuer Secret Key</b>\n\nEnter the issuer secret key (or send "skip" to keep current):',
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('⏭ Keep Current', 'skip_edit_issuer_secret')],
                    [Markup.button.callback('❌ Cancel', `edit_token_${tokenId}`)],
                ]),
            }
        );
    }

    async handleEditTokenIssuerSecret(@Ctx() ctx: Context, text: string) {
        const tokenId = ctx.session.data!.tokenId;
        const issuerPublic = ctx.session.data!.issuerPublic;
        const issuerSecret = text.toLowerCase() === 'skip' ? undefined : text.trim();

        try {
            const updateData: any = { issuerPublic };
            if (issuerSecret) {
                updateData.issuerSecret = issuerSecret;
            }

            await this.prisma.token.update({
                where: { id: tokenId },
                data: updateData,
            });

            await MessageManager.deleteRemembered(ctx);
            ctx.session = {};

            await ctx.reply('✅ Issuer keys updated successfully!', {
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('◀️ Back to Token', `edit_token_${tokenId}`)],
                ]),
            });
        } catch (error) {
            await ctx.reply(
                `❌ Failed to update issuer keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
                {
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('◀️ Back to Token', `edit_token_${tokenId}`)],
                    ]),
                }
            );
        }
    }

    async handleEditTokenBuyLink(@Ctx() ctx: Context, text: string) {
        const tokenId = ctx.session.data!.tokenId;
        const buyLink = text.toLowerCase() === 'remove' ? null : text.trim();

        try {
            await this.prisma.token.update({
                where: { id: tokenId },
                data: { buyLink },
            });

            await MessageManager.deleteRemembered(ctx);
            ctx.session = {};

            await ctx.reply(
                buyLink ? '✅ Buy link updated successfully!' : '✅ Buy link removed successfully!',
                {
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('◀️ Back to Token', `edit_token_${tokenId}`)],
                    ]),
                }
            );
        } catch (error) {
            await ctx.reply(
                `❌ Failed to update buy link: ${error instanceof Error ? error.message : 'Unknown error'}`,
                {
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('◀️ Back to Token', `edit_token_${tokenId}`)],
                    ]),
                }
            );
        }
    }

    @Action(/^skip_(issuer_public|issuer_secret|buylink)$/)
    async skipField(@Ctx() ctx: Context) {
        const field = ctx.match![1];

        if (field === 'issuer_public') {
            ctx.session.step = 'add_token_issuer_secret';
            await MessageManager.editOrSend(
                ctx,
                '🔐 <b>Issuer Secret Key</b>\n\nEnter the issuer secret key (or send "skip" to set later):',
                {
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('⏭ Skip', 'skip_issuer_secret')],
                        [Markup.button.callback('❌ Cancel', 'manage_tokens')],
                    ]),
                }
            );
        } else if (field === 'issuer_secret') {
            ctx.session.step = 'add_token_buylink';
            await MessageManager.editOrSend(
                ctx,
                '🔗 <b>Buy Link</b>\n\nEnter the buy link URL (or send "skip" to set later):',
                {
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('⏭ Skip', 'skip_buylink')],
                        [Markup.button.callback('❌ Cancel', 'manage_tokens')],
                    ]),
                }
            );
        } else if (field === 'buylink') {
            await this.handleAddTokenBuyLink(ctx, 'skip');
        }

        await ctx.answerCbQuery();
    }

    @Action('skip_edit_issuer_secret')
    async skipEditIssuerSecret(@Ctx() ctx: Context) {
        await this.handleEditTokenIssuerSecret(ctx, 'skip');
        await ctx.answerCbQuery();
    }
}
