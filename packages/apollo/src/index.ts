export * from './apolloCollector';
export * from './types';

import type { ApolloCollector } from './apolloCollector';

declare module '@debugr/core' {
  export interface TContextFixed {
    queryName?: string;
  }

  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    apollo: ApolloCollector<TTaskContext, TGlobalContext>;
  }
}
