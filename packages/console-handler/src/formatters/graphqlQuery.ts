import type { TContextBase, TContextShape } from '@debugr/core';
import { formatData, isEmpty } from '@debugr/core';
import type { GraphQLQueryLogEntry } from '@debugr/graphql-common';
import { AbstractConsoleFormatter } from './abstract';

export class GraphQLQueryConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-graphql-query-console-formatter';

  readonly entryType: string = 'graphql.query';

  formatEntry(entry: GraphQLQueryLogEntry<TTaskContext, TGlobalContext>): string {
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
