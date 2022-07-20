import { ApolloLogger } from './apollo';
import { Options } from './types';

export { ApolloLogger, Options };

declare module '@debugr/core' {
  export interface TContextFixed {
    queryName?: string;
  }

  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    apollo: ApolloLogger<TTaskContext, TGlobalContext>;
  }
}
