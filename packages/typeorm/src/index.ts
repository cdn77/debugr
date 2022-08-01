import { TypeORMPlugin, TypeORMPluginOptions } from './typeorm';

export { TypeORMPlugin, TypeORMPluginOptions };

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    typeorm: TypeORMPlugin<TTaskContext, TGlobalContext>;
  }
}
