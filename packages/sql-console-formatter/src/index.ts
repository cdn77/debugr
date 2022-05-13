import { SqlConsoleFormatter } from './formatter';

export { SqlConsoleFormatter } from './formatter';
export * from './types';

declare module '@debugr/core' {
  export interface Plugins {
    'sql-console': SqlConsoleFormatter;
  }
}
