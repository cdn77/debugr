import { ExpressLogger } from './express';
import { Options, HttpLogEntry } from './types';

export { ExpressLogger, Options, HttpLogEntry };

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextShape,
    TGlobalContext extends TContextShape = {},
  > {
    express: ExpressLogger<Partial<TTaskContext>, TGlobalContext>;
  }
}
