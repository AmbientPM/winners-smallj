import { Markup } from 'telegraf';

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

export const adminMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📸 Welcome Image', 'set_welcome_image')],
    [Markup.button.callback('📝 Welcome Text', 'welcome_text_settings')],
    // [Markup.button.callback('🪙 Manage Tokens', 'manage_tokens')],
    [Markup.button.callback('💰 Deposit Settings', 'deposit_settings')],
]);
