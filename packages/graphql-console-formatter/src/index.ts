import { GraphQLConsoleFormatter } from './formatter';

export { GraphQLConsoleFormatter } from './formatter';
export * from './types';

declare module '@debugr/core' {
  export interface Plugins {
    'graphql-console': GraphQLConsoleFormatter;
  }
}
