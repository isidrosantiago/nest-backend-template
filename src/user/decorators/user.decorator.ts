import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressRequest } from 'src/types/expressRequest.interface';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest<ExpressRequest>();

  if (!user) return null;
  if (data) return user[data];
  return user;
});
