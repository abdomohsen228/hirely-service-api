import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwtPayload.interface';

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return req.user as JwtPayload;
  },
);
