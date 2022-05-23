import { TypeormLogger } from './typeorm';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextShape,
    TGlobalContext extends TContextShape = {},
  > {
    typeorm: TypeormLogger<Partial<TTaskContext>, TGlobalContext>;
  }
}
