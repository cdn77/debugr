import { ExpressLogger } from './express';
import { Options, HttpLogEntry } from './types';

export { ExpressLogger, Options, HttpLogEntry };

declare module '@debugr/core' {
  export interface TContextFixed {
    restRoute?: string;
    restMethod?: string;
  }

  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    express: ExpressLogger<Partial<TTaskContext>, TGlobalContext>;
  }
}
