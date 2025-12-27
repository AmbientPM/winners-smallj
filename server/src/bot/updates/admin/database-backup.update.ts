import { Injectable, Logger } from '@nestjs/common';
import { Update, Ctx, Action, InjectBot } from 'nestjs-telegraf';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Telegraf } from 'telegraf';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Context } from '../../interfaces/context.interface';
import { IsAdminGuard } from '../../guards/is-admin.guard';
import { IsPrivateGuard } from '../../guards/is-private.guard';
import { IsInGroupGuard, UserGroup } from '../../guards/is-in-group.guard';
import { MessageManager } from '../../utils/message-manager';

const execAsync = promisify(exec);

@Update()
@Injectable()
export class AdminDatabaseBackupUpdate {
    private readonly logger = new Logger(AdminDatabaseBackupUpdate.name);

    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly configService: ConfigService,
    ) { }

    // Automatic backup every day at 3 AM
    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async handleScheduledBackup() {
        this.logger.log('Starting scheduled database backup...');

        try {
            const backupFilePath = await this.createBackup();
            await this.sendBackupToRecipients(backupFilePath);
            await fs.unlink(backupFilePath);
            this.logger.log('Scheduled backup completed successfully');
        } catch (error) {
            this.logger.error('Scheduled backup failed:', error);
        }
    }

    @Action('database_backup')
    @UseGuards(IsPrivateGuard, IsAdminGuard, IsInGroupGuard)
    @UserGroup('BACKUP_RECIPIENT_IDS')
    async onDatabaseBackup(@Ctx() ctx: Context) {
        await ctx.answerCbQuery();

        const loadingMsg = await ctx.reply('⏳ Creating database backup...');

        try {
            const backupFilePath = await this.createBackup();

            // Get file stats
            const stats = await fs.stat(backupFilePath);
            const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            const backupFileName = path.basename(backupFilePath);

            // Extract database name for display
            const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');
            const dbUrl = new URL(databaseUrl);
            const database = dbUrl.pathname.slice(1);

            await MessageManager.safeDelete(ctx, loadingMsg.message_id);

            // Send backup file to admin who requested it
            await ctx.replyWithDocument(
                { source: backupFilePath, filename: backupFileName },
                {
                    caption: `✅ <b>Database Backup</b>\n\n` +
                        `📅 Date: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC\n` +
                        `📦 Size: ${fileSizeInMB} MB\n` +
                        `🗃 Database: ${database}`,
                    parse_mode: 'HTML',
                }
            );

            // Clean up backup file
            await fs.unlink(backupFilePath);
            this.logger.log('Manual backup completed and file cleaned up');

        } catch (error) {
            this.logger.error('Error creating manual backup:', error);

            await MessageManager.safeDelete(ctx, loadingMsg.message_id);

            await ctx.reply(
                '❌ <b>Error creating backup</b>\n\n' +
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { parse_mode: 'HTML' }
            );
        }
    }

    private async createBackup(): Promise<string> {
        // Get database connection string
        const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup-${timestamp}.sql`;
        const backupPath = path.join(process.cwd(), backupFileName);

        this.logger.log(`Creating backup: ${backupFileName}`);

        // Extract connection details from DATABASE_URL
        const dbUrl = new URL(databaseUrl);
        const user = dbUrl.username;
        const password = dbUrl.password;
        const host = dbUrl.hostname;
        const port = dbUrl.port || '5432';
        const database = dbUrl.pathname.slice(1);

        // Set password as environment variable for pg_dump
        const env = {
            ...process.env,
            PGPASSWORD: password,
        };

        // Execute pg_dump
        const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F p -f ${backupPath}`;

        await execAsync(command, { env });

        this.logger.log('Backup file created successfully');
        return backupPath;
    }

    private async sendBackupToRecipients(backupFilePath: string): Promise<void> {
        const backupRecipientIds = this.configService.getOrThrow<string>('BACKUP_RECIPIENT_IDS');

        if (!backupRecipientIds) {
            this.logger.warn('BACKUP_RECIPIENT_IDS not configured, skipping automated backup sending');
            return;
        }

        const recipientIds = backupRecipientIds
            .split(',')
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));

        if (recipientIds.length === 0) {
            this.logger.warn('No valid recipient IDs found in BACKUP_RECIPIENT_IDS');
            return;
        }

        // Get file stats
        const stats = await fs.stat(backupFilePath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        const backupFileName = path.basename(backupFilePath);

        // Extract database name for display
        const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');
        const dbUrl = new URL(databaseUrl);
        const database = dbUrl.pathname.slice(1);

        const caption = `🤖 <b>Scheduled Database Backup</b>\n\n` +
            `📅 Date: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC\n` +
            `📦 Size: ${fileSizeInMB} MB\n` +
            `🗃 Database: ${database}`;

        // Send to all recipients
        for (const recipientId of recipientIds) {
            try {
                await this.bot.telegram.sendDocument(
                    recipientId,
                    { source: backupFilePath, filename: backupFileName },
                    {
                        caption,
                        parse_mode: 'HTML',
                    }
                );
                this.logger.log(`Backup sent to recipient: ${recipientId}`);
            } catch (error) {
                this.logger.error(`Failed to send backup to ${recipientId}:`, error);
            }
        }
    }
}
