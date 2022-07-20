import { InsanerLogger } from './insaner';
import { Options } from './types';

export { InsanerLogger, Options };

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    insaner: InsanerLogger<TTaskContext, TGlobalContext>;
  }
}
