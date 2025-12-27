import { ConfigService } from '@nestjs/config';
import { InlineKeyboardButton } from 'telegraf/types';

export interface ButtonConfig {
    text: string;
    callback: string;
    group?: string; // Config key for user group (e.g., 'BACKUP_RECIPIENT_IDS')
}

export class KeyboardBuilder {
    static filterButtonsByGroup(
        buttons: ButtonConfig[],
        userId: number,
        configService: ConfigService,
    ): InlineKeyboardButton[][] {
        return buttons
            .filter((button) => {
                if (!button.group) {
                    return true; // Show button if no group restriction
                }

                const groupIds = configService.get<string>(button.group);

                if (!groupIds) {
                    return false; // Hide if group config not found
                }

                const allowedIds = groupIds
                    .split(',')
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id));

                return allowedIds.includes(userId);
            })
            .map((button) => [{ text: button.text, callback_data: button.callback }]);
    }
}
