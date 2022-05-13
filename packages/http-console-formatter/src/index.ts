import { HttpConsoleFormatter } from './formatter';

export { HttpConsoleFormatter } from './formatter';
export * from './types';

declare module '@debugr/core' {
  export interface Plugins {
    'http-console': HttpConsoleFormatter;
  }
}
