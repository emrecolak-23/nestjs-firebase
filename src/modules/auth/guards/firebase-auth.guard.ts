import * as admin from 'firebase-admin';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

export type RequestWithUser = Request & {
  user: { email: string; id: string };
  token: string;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const sessionCookie = request.cookies.session as string | undefined | null;
    if (!sessionCookie) return false;

    try {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);

      console.log(decodedClaims, 'decodedClaims');
      request.user = {
        email: decodedClaims.email,
        id: decodedClaims.dbUserId,
      };
      if (decodedClaims.email) return true;

      console.log(request.user, 'request.user');

      return true;
    } catch (_err) {
      return false;
    }
  }
}
