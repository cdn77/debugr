import type { TContextBase, TContextShape } from '@debugr/core';
import { EntryType, formatData, isEmpty } from '@debugr/core';
import type { GraphqlQueryLogEntry } from '@debugr/graphql-common';
import { AbstractConsoleFormatter } from './abstract';

export class GraphqlQueryConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  public readonly id = 'debugr-graphql-query-console-formatter';
  public readonly entryType = EntryType.GraphqlQuery;

  public formatEntry(entry: GraphqlQueryLogEntry<TTaskContext, TGlobalContext>): string {
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
