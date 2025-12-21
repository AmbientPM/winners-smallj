import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { IsInitDataRequired } from '../validators/init-data.validator';

export class AddWalletDto {
    @IsInitDataRequired()
    initData?: string;

    @IsNotEmpty()
    @IsString()
    publicKey: string;
}

export class VerifyWalletDto {
    @IsInitDataRequired()
    initData?: string;

    @IsNotEmpty()
    @IsNumber()
    walletId: number;
}

export class DeleteWalletDto {
    @IsInitDataRequired()
    initData?: string;

    @IsNotEmpty()
    @IsNumber()
    walletId: number;
}

export class SetActiveWalletDto {
    @IsInitDataRequired()
    initData?: string;

    @IsNotEmpty()
    @IsNumber()
    walletId: number;
}
