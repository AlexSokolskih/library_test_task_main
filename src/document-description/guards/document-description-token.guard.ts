import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class DocumentDescriptionTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expectedToken = process.env.DOCUMENT_DESCRIPTION_TOKEN;

    const authorization = request.headers.authorization;
    const token =
      typeof authorization === 'string'
        ? authorization.replace(/^Bearer\s+/i, '')
        : undefined;

    if (token !== expectedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
