import { InsanerPlugin } from './insaner';
import { Options } from './types';

export { InsanerPlugin, Options };

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    insaner: InsanerPlugin<TTaskContext, TGlobalContext>;
  }
}
