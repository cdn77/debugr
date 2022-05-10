import { InsanerLogger } from './insaner';
import { Options } from './types';

export { InsanerLogger, Options };

export function insanerLogger(options?: Options): InsanerLogger {
  return new InsanerLogger(options);
}

declare module '@debugr/core' {
  export interface Plugins<
    TContext extends TContextBase = { processId: string },
    TGlobalContext extends Record<string, any> = {},
  > {
    insaner: InsanerLogger<Partial<TContext>, TGlobalContext>;
  }
}
