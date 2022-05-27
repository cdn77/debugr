import { ApolloLogger } from './apollo';
import { Options, GraphQlLogEntry } from './types';

export { ApolloLogger, Options, GraphQlLogEntry };

declare module '@debugr/core' {
  export interface TContextBase {
    queryName?: string;
  }

  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    apollo: ApolloLogger<Partial<TTaskContext>, TGlobalContext>;
  }
}
