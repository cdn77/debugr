import { TContextBase, TContextShape, formatData, isEmpty } from '@debugr/core';
import { GraphQlLogEntry } from '@debugr/graphql-common';
import { AbstractConsoleFormatter } from './abstract';

export class GraphQLConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-graphql-console-formatter';

  readonly entryFormat: string = 'graphql';

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): GraphQLConsoleFormatter<TTaskContext, TGlobalContext> {
    return new GraphQLConsoleFormatter<TTaskContext, TGlobalContext>();
  }

  formatEntry(entry: GraphQlLogEntry<TTaskContext, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    const variables = isEmpty(entry.data.variables) ? undefined : entry.data.variables;

    return this.formatParts(
      'GraphQL Query:',
      entry.data.query,
      variables && 'Variables:',
      variables && formatData(variables),
      entry.data.operation && `Operation: ${entry.data.operation}`,
    );
  }
}
