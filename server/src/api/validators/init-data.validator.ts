import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

import dotenv from 'dotenv';
dotenv.config();

export function IsInitDataRequired(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isInitDataRequired',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const isDev = process.env.IS_DEV === 'true';

                    // In development, initData is optional
                    if (isDev) {
                        // Allow undefined, null, or empty string in dev
                        return true;
                    }

                    // In production, initData is required and must be a non-empty string
                    if (value === undefined || value === null) {
                        return false;
                    }

                    return typeof value === 'string' && value.trim().length > 0;
                },
                defaultMessage(args: ValidationArguments) {
                    return 'initData must be a string';
                },
            },
        });
    };
}
