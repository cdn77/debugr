export * from './insanerCollector';
export { InsanerCollectorOptions } from './types';

import type { InsanerCollector } from './insanerCollector';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    insaner: InsanerCollector<TTaskContext, TGlobalContext>;
  }
}
