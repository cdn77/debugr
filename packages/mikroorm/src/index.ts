import type { MikroORMPlugin } from './mikroorm';

export * from './mikroorm';
export * from './types';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    mikroorm: MikroORMPlugin<TTaskContext, TGlobalContext>;
  }
}
