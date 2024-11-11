import { initContract } from '@ts-rest/core';
import { authContract } from './api-contracts';

export * from './api-contracts';

const c = initContract();

export const contracts = c.router({
  auth: authContract,
});
