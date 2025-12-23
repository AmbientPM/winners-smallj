import { Update, Ctx, On } from 'nestjs-telegraf';
import { UseGuards, Injectable } from '@nestjs/common';
import type { Context } from '../interfaces/context.interface';
import { IsPrivateGuard } from '../guards/is-private.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AdminWelcomeImageUpdate } from './admin/welcome-image.update';
import { AdminTokenManagementUpdate } from './admin/token-management.update';

@Update()
@UseGuards(IsPrivateGuard, IsAdminGuard)
@Injectable()
export class TextHandlerUpdate {
    constructor(
        private readonly welcomeImageUpdate: AdminWelcomeImageUpdate,
        private readonly tokenManagementUpdate: AdminTokenManagementUpdate,
    ) { }

    @On('text')
    async handleTextInput(@Ctx() ctx: Context) {
        const step = ctx.session.step;
        const text = (ctx.message as any)?.text;

        console.log('[TextHandler] Received text, session step:', step);

        if (!step || !text) {
            console.log('[TextHandler] No step in session, ignoring');
            return;
        }

        // Token management handlers
        if (step === 'add_token_code') {
            return this.tokenManagementUpdate.handleAddTokenCode(ctx, text);
        }
        if (step === 'add_token_issuer_public') {
            return this.tokenManagementUpdate.handleAddTokenIssuerPublic(ctx, text);
        }
        if (step === 'add_token_issuer_secret') {
            return this.tokenManagementUpdate.handleAddTokenIssuerSecret(ctx, text);
        }
        if (step === 'add_token_buylink') {
            return this.tokenManagementUpdate.handleAddTokenBuyLink(ctx, text);
        }
        if (step === 'edit_token_code') {
            return this.tokenManagementUpdate.handleEditTokenCode(ctx, text);
        }
        if (step === 'edit_token_issuer_public') {
            return this.tokenManagementUpdate.handleEditTokenIssuerPublic(ctx, text);
        }
        if (step === 'edit_token_issuer_secret') {
            return this.tokenManagementUpdate.handleEditTokenIssuerSecret(ctx, text);
        }
        if (step === 'edit_token_buylink') {
            return this.tokenManagementUpdate.handleEditTokenBuyLink(ctx, text);
        }

        console.log('[TextHandler] No handler found for step:', step);
    }

    @On('photo')
    async handlePhoto(@Ctx() ctx: Context) {
        const step = ctx.session.step;

        console.log('[TextHandler] Received photo, session step:', step);

        if (step === 'welcome_image') {
            return this.welcomeImageUpdate.handlePhoto(ctx);
        }

        console.log('[TextHandler] No photo handler found for step:', step);
    }
}
