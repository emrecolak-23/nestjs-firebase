import * as admin from 'firebase-admin';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/entities/users.entity';
import { Model } from 'mongoose';
import { TsRestException } from '@ts-rest/nest';
import { contracts } from 'libs/contracts';
import { UserType } from 'common/types/user.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async verifyAndUpsertUser(accessToken: string): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: UserType;
  }> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(accessToken);
      const userInfo = await this.userModel
        .findOneAndUpdate(
          {
            email: decodedToken.email,
          },
          {
            email: decodedToken.email,
            username: decodedToken.name,
            photo: decodedToken.picture,
          },
          {
            upsert: true,
            new: true,
          },
        )
        .lean<User>();

      await admin.auth().setCustomUserClaims(decodedToken.uid, {
        dbUserId: userInfo._id,
      });

      return {
        decodedToken,
        userInfo,
      };
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  async createSessionCookie(accessToken: string): Promise<{
    sessionCookie: string;
    expiresIn: number;
  }> {
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(accessToken, {
      expiresIn,
    });

    return {
      sessionCookie,
      expiresIn,
    };
  }

  async getUserInfoByEmail(email: string) {
    const userInfo = await this.userModel.findOne({ email }, { password: 0 });

    if (!userInfo) {
      throw new TsRestException(contracts.auth.me, {
        status: HttpStatus.NOT_FOUND,
        body: {
          message: 'User not found',
        },
      });
    }

    return userInfo;
  }

  async revokeToken(sessionCookie: string): Promise<void> {
    try {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie);
      await admin.auth().revokeRefreshTokens(decodedClaims.sub);
    } catch (err) {
      if (err instanceof Error) {
        throw new TsRestException(contracts.auth.logout, {
          status: HttpStatus.UNAUTHORIZED,
          body: {
            message: "You're not authorized to access this resource",
          },
        });
      }

      this.logger.error('Error at revokeToken: ', err);
      throw new TsRestException(contracts.auth.logout, {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        body: {
          message: 'Error revoking token',
        },
      });
    }
  }
}
