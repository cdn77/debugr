import { ExpressLogger } from './express';
import { Options } from './types';

export { ExpressLogger, Options };

export function expressLogger(options?: Options): ExpressLogger {
  return new ExpressLogger(options);
}

declare module '@debugr/core' {
  export interface Plugins<
    TContext extends TContextBase = { processId: string },
    TGlobalContext extends Record<string, any> = {},
  > {
    express: ExpressLogger<Partial<TContext>, TGlobalContext>;
  }
}
