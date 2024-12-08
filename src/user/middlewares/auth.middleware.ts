import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from '../user.service';
import { ExpressRequest } from 'src/types/expressRequest.interface';
import { NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequest, _res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as Pick<
        UserEntity,
        'id' | 'email' | 'username'
      >;

      const user = await this.userService.findById(decoded.id);
      req.user = user;
      next();
    } catch {
      req.user = null;
      next();
    }
  }
}
