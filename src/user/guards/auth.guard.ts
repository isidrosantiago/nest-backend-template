import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExpressRequest } from 'src/types/expressRequest.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const { user } = ctx.switchToHttp().getRequest<ExpressRequest>();

    if (!user) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return true;
  }
}
