export * from './expressCollector';
export type { ExpressCollectorOptions } from './types';

import type { TContextBase, TContextShape } from '@debugr/core';
import type { ExpressCollector } from './expressCollector';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    express: ExpressCollector<TTaskContext, TGlobalContext>;
  }
}
