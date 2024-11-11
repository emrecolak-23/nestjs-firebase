import {
  Controller,
  HttpStatus,
  Logger,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { TsRestException, tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { contracts } from 'libs/contracts';
import { COOKIE_NAME } from './constants';
import { COOKIE_ATTRIBUTE } from './enums';
import { NODE_ENV } from 'common/enums';
import {
  FirebaseAuthGuard,
  RequestWithUser,
} from './guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @TsRestHandler(contracts.auth.login)
  async login(@Res({ passthrough: true }) response: Response) {
    return tsRestHandler(contracts.auth.login, async ({ headers }) => {
      const accessToken = headers.authorization.replace('Bearer ', '');
      console.log(accessToken, response);
      try {
        const { userInfo } =
          await this.authService.verifyAndUpsertUser(accessToken);

        const { sessionCookie, expiresIn } =
          await this.authService.createSessionCookie(accessToken);

        response.cookie(COOKIE_NAME, sessionCookie, {
          maxAge: expiresIn,
          httpOnly: true,
          secure: process.env.NODE_ENV === NODE_ENV.PRODUCTION,
          sameSite:
            process.env.NODE_ENV === NODE_ENV.PRODUCTION
              ? COOKIE_ATTRIBUTE.NONE
              : COOKIE_ATTRIBUTE.LAX,
        });

        return {
          status: HttpStatus.OK,
          body: userInfo,
        };
      } catch (err) {
        if (err instanceof Error) {
          return {
            status: HttpStatus.UNAUTHORIZED,
            body: {
              message: "You're not authorized to access this resource",
            },
          };
        }

        this.logger.error(err);

        return {
          status: 500,
          body: {
            message: err.message,
          },
        };
      }
    });
  }

  @TsRestHandler(contracts.auth.me)
  @UseGuards(FirebaseAuthGuard)
  async me(@Req() request: RequestWithUser) {
    return tsRestHandler(contracts.auth.me, async () => {
      try {
        return {
          status: HttpStatus.OK,
          body: await this.authService.getUserInfoByEmail(request.user.email),
        };
      } catch (err) {
        if (err instanceof TsRestException) throw err;

        this.logger.error(`Error  at me: ${err}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: {
            message: 'Internal server error',
          },
        };
      }
    });
  }

  @TsRestHandler(contracts.auth.logout)
  async logout(@Req() request: RequestWithUser, @Res() response: Response) {
    return tsRestHandler(contracts.auth.logout, async () => {
      try {
        await this.authService.revokeToken(request.cookies.session);
        response.clearCookie(COOKIE_NAME);

        return {
          status: HttpStatus.OK,
          body: null,
        };
      } catch (err) {
        if (err instanceof TsRestException) throw err;

        this.logger.error(`Error at logout: ${err}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: {
            message: 'Internal server error',
          },
        };
      }
    });
  }
}
