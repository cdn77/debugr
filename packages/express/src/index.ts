import { Logger } from '@debugr/core';
import { ExpressLogger } from './express';
import { Options } from './types';

export { ExpressLogger, Options };

export function expressLogger(options?: Options): ExpressLogger {
  return new ExpressLogger(options);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type __dummy__ = Logger;

declare module '@debugr/core' {
  export interface Plugins {
    express: ExpressLogger;
  }
}

declare global {
  namespace Express {
    export interface Request {
      logger: Logger;
    }
  }
}
