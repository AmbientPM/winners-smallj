import { Update, Ctx, On } from 'nestjs-telegraf';
import { UseGuards, Injectable } from '@nestjs/common';
import type { Context } from '../interfaces/context.interface';
import { IsPrivateGuard } from '../guards/is-private.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AdminWelcomeImageUpdate } from './admin/welcome-image.update';

@Update()
@UseGuards(IsPrivateGuard, IsAdminGuard)
@Injectable()
export class TextHandlerUpdate {
    constructor(
        private readonly welcomeImageUpdate: AdminWelcomeImageUpdate,
    ) { }

    @On('text')
    async handleTextInput(@Ctx() ctx: Context) {
        const step = ctx.session.step;

        console.log('[TextHandler] Received text, session step:', step);

        if (!step) {
            console.log('[TextHandler] No step in session, ignoring');
            return;
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
