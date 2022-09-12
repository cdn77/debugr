export * from './formatters';
export * from './consoleFormatter';
export * from './consoleLogHandler';
export * from './types';

import type { ConsoleLogHandler } from './consoleLogHandler';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    console: ConsoleLogHandler<TTaskContext, TGlobalContext>;
  }
}
