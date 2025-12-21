import { IsInitDataRequired } from '../validators/init-data.validator';

export class UserStatisticsDto {
    @IsInitDataRequired()
    initData?: string;
}

