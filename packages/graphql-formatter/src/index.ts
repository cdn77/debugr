import { GraphQLFormatter } from './formatter';
import { GraphQLData } from './types';

export { GraphQLFormatter } from './formatter';
export * from './types';

export function graphqlFormatter(): GraphQLFormatter {
  return new GraphQLFormatter();
}

declare module '@debugr/core' {
  export interface Plugins {
    graphql: GraphQLFormatter;
  }

  export interface LoggerInterface {
    log(plugin: 'graphql', level: number, data: GraphQLData): void;
  }
}
