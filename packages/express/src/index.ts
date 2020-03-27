import { Logger } from '@debugr/core';
import { ExpressLogger } from './express';
import { Options } from './types';

export { ExpressLogger, Options };

export function expressLogger(options?: Options): ExpressLogger {
  return new ExpressLogger(options);
}

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
