import type { InsanerPlugin } from './insaner';

export * from './insaner';
export * from './types';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    insaner: InsanerPlugin<TTaskContext, TGlobalContext>;
  }
}
