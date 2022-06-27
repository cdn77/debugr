import {
  MikroORMLogger,
  MikroORMLoggerOptions,
  MikroORMLogLevel,
  MikroORMLogNamespace,
  MikroORMLevelMap,
  MikroORMNamespaceMap,
} from './mikroorm';

export {
  MikroORMLogger,
  MikroORMLoggerOptions,
  MikroORMLogLevel,
  MikroORMLogNamespace,
  MikroORMLevelMap,
  MikroORMNamespaceMap,
};

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  > {
    mikroorm: MikroORMLogger<Partial<TTaskContext>, TGlobalContext>;
  }
}
