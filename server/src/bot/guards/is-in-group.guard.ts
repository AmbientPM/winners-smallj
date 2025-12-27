import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import type { Context } from '../interfaces/context.interface';

export const USER_GROUP_KEY = 'userGroup';
export const UserGroup = (groupConfigKey: string) => SetMetadata(USER_GROUP_KEY, groupConfigKey);

@Injectable()
export class IsInGroupGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const groupConfigKey = this.reflector.get<string>(USER_GROUP_KEY, context.getHandler());

        if (!groupConfigKey) {
            return true; // Если группа не указана, разрешаем доступ
        }

        const ctx = TelegrafExecutionContext.create(context);
        const { from } = ctx.getContext<Context>();

        if (!from?.id) {
            return false;
        }

        const groupIds = this.configService.get<string>(groupConfigKey);

        if (!groupIds) {
            return false; // Если конфиг группы не найден, запрещаем доступ
        }

        const allowedIds = groupIds
            .split(',')
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));

        return allowedIds.includes(from.id);
    }
}
