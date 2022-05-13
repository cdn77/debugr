import { ExpressLogger } from './express';
import { Options, HttpLogEntry } from './types';

export { ExpressLogger, Options, HttpLogEntry };

declare module '@debugr/core' {
  export interface Plugins<
    TContext extends TContextBase = { processId: string },
    TGlobalContext extends Record<string, any> = {},
  > {
    express: ExpressLogger<Partial<TContext>, TGlobalContext>;
  }
}
