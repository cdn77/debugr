import { TypeormLogger, TypeORMLoggerOptions } from './typeorm';

export { TypeormLogger, TypeORMLoggerOptions };

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    typeorm: TypeormLogger<Partial<TTaskContext>, TGlobalContext>;
  }
}
