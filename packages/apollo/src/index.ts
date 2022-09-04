import { ApolloPlugin } from './apollo';
import type { Options } from './types';

export { ApolloPlugin, Options };

declare module '@debugr/core' {
  export interface TContextFixed {
    queryName?: string;
  }

  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    apollo: ApolloPlugin<TTaskContext, TGlobalContext>;
  }
}
