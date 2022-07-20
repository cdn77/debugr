import { ExpressLogger } from './express';
import { Options } from './types';

export { ExpressLogger, Options };

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    express: ExpressLogger<TTaskContext, TGlobalContext>;
  }
}
