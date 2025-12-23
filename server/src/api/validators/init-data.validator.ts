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

                    // In development, initData is optional (allow undefined, null, or empty string)
                    if (isDev) {
                        return true;
                    }

                    // In production, initData is required and must be a non-empty string
                    // Allow null to pass validation (will be handled by controller)
                    if (value === null) {
                        return true;
                    }

                    if (value === undefined) {
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
