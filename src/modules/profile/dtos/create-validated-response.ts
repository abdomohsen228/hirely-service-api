import { InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

/** Maps service output through a response DTO and runs class-validator (same idea as typed requests). */
export function createValidatedResponse<T extends object>(
  Cls: new () => T,
  plain: unknown,
): T {
  const instance = plainToInstance(Cls, plain as object, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(instance, {
    whitelist: false,
  });
  if (errors.length > 0) {
    throw new InternalServerErrorException({
      message: 'Response validation failed',
      errors: errors.map((e) => ({
        property: e.property,
        constraints: e.constraints,
      })),
    });
  }
  return instance;
}
