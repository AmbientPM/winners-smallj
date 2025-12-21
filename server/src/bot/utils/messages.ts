import { PrismaService } from '../../database/prisma.service';

export async function getStakingInfo(prisma: PrismaService): Promise<string> {
    const settings = await prisma.settings.findFirst();
    
    // Get SILVER token for issuer info
    const silverToken = await prisma.token.findUnique({
        where: { code: 'SILVER' },
    });

    let text = '<b>⚙️ Admin Panel</b>\n\n';
    text += '<b>📊 Current Settings:</b>\n\n';

    text += `<b>XLM Deposit:</b>\n`;
    text += `  Address: <code>${settings?.depositAddress ? settings.depositAddress.substring(0, 15) + '...' : '❌ Not set'}</code>\n`;
    text += `  Amount: ${settings?.depositAmount || '❌ Not set'}\n\n`;

    text += `<b>Issuer (SILVER):</b>\n`;
    text += `  Public: <code>${silverToken?.issuerPublic ? silverToken.issuerPublic.substring(0, 15) + '...' : '❌ Not set'}</code>\n`;
    text += `  Sending: ${settings?.sendingEnabled ? '✅ Enabled' : '❌ Disabled'}\n\n`;

    text += `<b>Purchase Distributor:</b> ${settings?.purchaseDistributorSecret ? '✅ Configured' : '❌ Not set'}\n\n`;

    text += '👇 <i>Use the buttons below to manage settings</i>';

    return text;
}


