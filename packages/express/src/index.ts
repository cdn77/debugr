import { ExpressPlugin } from './express';
import { Options } from './types';

export { ExpressPlugin, Options };

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    express: ExpressPlugin<TTaskContext, TGlobalContext>;
  }
}
