import { GraphQLHtmlFormatter } from './formatter';

export { GraphQLHtmlFormatter } from './formatter';
export * from './types';

declare module '@debugr/core' {
  export interface Plugins {
    'graphql-html': GraphQLHtmlFormatter;
  }
}
