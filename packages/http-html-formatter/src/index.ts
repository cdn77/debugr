import { HttpHtmlFormatter } from './formatter';

export { HttpHtmlFormatter } from './formatter';
export * from './types';

declare module '@debugr/core' {
  export interface Plugins {
    'http-html': HttpHtmlFormatter;
  }
}
