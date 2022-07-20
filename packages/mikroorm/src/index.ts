import { MikroORMLogger } from './mikroorm';

export { MikroORMLogger };
export * from './types';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    mikroorm: MikroORMLogger<TTaskContext, TGlobalContext>;
  }
}
