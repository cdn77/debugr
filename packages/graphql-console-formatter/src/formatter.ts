import { formatData, FormatterPlugin, isEmpty, TContextBase } from '@debugr/core';
import { GraphQlLogEntry } from '@debugr/apollo';

export class GraphQLConsoleFormatter<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> implements FormatterPlugin<Partial<TContext>, TGlobalContext>
{
  readonly id: string = 'graphql';

  readonly entryFormat: string = 'graphql';

  readonly handlerSupport: string = 'console';

  injectLogger(): void {}

  getEntryLabel(): string {
    return 'GraphQL request';
  }

  getEntryTitle(entry: GraphQlLogEntry<Partial<TContext>, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    return entry.data.operation || entry.data.query.replace(/{[\s\S]*$/, '').trim();
  }

  formatEntry(entry: GraphQlLogEntry<Partial<TContext>, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    const parts: string[] = [];

    if (entry.data.operation) {
      parts.push(`Operation: ${entry.data.operation}`);
    }

    parts.push('Query:', entry.data.query);

    if (!isEmpty(entry.data.variables)) {
      parts.push('Variables:', formatData(entry.data.variables));
    }

    return parts.join('\n');
  }
}
