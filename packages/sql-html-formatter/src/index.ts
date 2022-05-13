import { SqlHtmlFormatter } from './formatter';

export { SqlHtmlFormatter } from './formatter';
export * from './types';

declare module '@debugr/core' {
  export interface Plugins {
    'sql-html': SqlHtmlFormatter;
  }
}
