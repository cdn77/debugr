import type { ExpressPlugin } from './express';

export * from './express';
export { Options } from './types';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    express: ExpressPlugin<TTaskContext, TGlobalContext>;
  }
}
