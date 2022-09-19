import type { ExpressCollector } from './expressCollector';

export * from './expressCollector';
export { ExpressCollectorOptions } from './types';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    express: ExpressCollector<TTaskContext, TGlobalContext>;
  }
}
