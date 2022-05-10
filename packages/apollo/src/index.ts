import { ApolloLogger } from './apollo';
import { Options } from './types';

export { ApolloLogger, Options };

export function apolloLogger(options?: Options): ApolloLogger {
  return new ApolloLogger(options);
}

declare module '@debugr/core' {
  export interface Plugins<
    TContext extends TContextBase = { processId: string },
    TGlobalContext extends Record<string, any> = {},
  > {
    apollo: ApolloLogger<Partial<TContext>, TGlobalContext>;
  }
}
