import { ApolloLogger } from './apollo';
import { Options, GraphQlLogEntry } from './types';

export { ApolloLogger, Options, GraphQlLogEntry };

export function apolloLogger(options?: Options): ApolloLogger {
  return new ApolloLogger(options);
}

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextShape,
    TGlobalContext extends TContextShape = {},
  > {
    apollo: ApolloLogger<Partial<TTaskContext>, TGlobalContext>;
  }
}
