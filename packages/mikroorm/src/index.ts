export * from './mikroormCollector';
export * from './types';

import type { TContextBase, TContextShape } from '@debugr/core';
import type { MikroORMCollector } from './mikroormCollector';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    mikroorm: MikroORMCollector<TTaskContext, TGlobalContext>;
  }
}
