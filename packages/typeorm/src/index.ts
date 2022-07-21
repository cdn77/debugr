import { TypeORMPlugin, TypeORMLoggerOptions } from './typeorm';

export { TypeORMPlugin, TypeORMLoggerOptions };

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    typeorm: TypeORMPlugin<TTaskContext, TGlobalContext>;
  }
}
