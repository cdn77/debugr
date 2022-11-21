export * from './formatters';
export * from './consoleFormatter';
export * from './consoleHandler';
export * from './types';

import type { ConsoleHandler } from './consoleHandler';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    console: ConsoleHandler<TTaskContext, TGlobalContext>;
  }
}
