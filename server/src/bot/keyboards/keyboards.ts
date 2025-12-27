import { Markup } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { KeyboardBuilder, ButtonConfig } from '../utils/keyboard-builder';

export const cancelKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('❌ Cancel', 'cancel')],
]);

export const backToMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('◀️ Back to Menu', 'menu')],
]);

export const backToStakingKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('◀️ Back', 'menu')],
]);

export const backToLiquidityKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('◀️ Back', 'liquidity')],
]);

export const userMenuKeyboard = (appUrl: string) =>
    Markup.inlineKeyboard([
        Markup.button.webApp('🕹 App', appUrl),
    ]);

// Admin menu button configuration with group restrictions
const adminMenuButtons: ButtonConfig[] = [
    { text: '📸 Welcome Image', callback: 'set_welcome_image' },
    { text: '📝 Welcome Text', callback: 'welcome_text_settings' },
    // { text: '🪙 Manage Tokens', callback: 'manage_tokens' },
    { text: '💰 Deposit Settings', callback: 'deposit_settings' },
    { text: '💾 Database Backup', callback: 'database_backup', group: 'BACKUP_RECIPIENT_IDS' },
];

export const adminMenuKeyboard = (userId: number, configService: ConfigService) => {
    const buttons = KeyboardBuilder.filterButtonsByGroup(adminMenuButtons, userId, configService);
    return Markup.inlineKeyboard(buttons);
};
