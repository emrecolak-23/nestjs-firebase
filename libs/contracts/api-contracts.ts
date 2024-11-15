import { initContract } from '@ts-rest/core';
import { UserType } from 'common/types/user.type';
import { z } from 'zod';

const c = initContract();

export const authContract = c.router(
  {
    login: {
      method: 'POST',
      path: '/login',
      body: c.type<null>(),
      headers: z.object({
        authorization: z.string().startsWith('Bearer '),
      }),
      strictStatusCodes: true,
      responses: {
        200: c.type<UserType>(),
        400: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    me: {
      method: 'GET',
      path: '/me',
      strictStatusCodes: true,
      responses: {
        200: c.type<UserType>(),
        403: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    logout: {
      method: 'POST',
      path: '/logout',
      body: c.type<null>(),
      strictStatusCodes: true,
      responses: {
        200: c.type<null>(),
        400: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  {
    pathPrefix: '/auth',
  },
);
