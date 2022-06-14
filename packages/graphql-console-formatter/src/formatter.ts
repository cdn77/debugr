import {
  formatData,
  FormatterPlugin,
  isEmpty,
  TContextBase,
  TContextShape,
  GraphQlLogEntry,
} from '@debugr/core';

export class GraphQLConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<Partial<TTaskContext>, TGlobalContext>
{
  readonly id: string = 'graphql';

  readonly entryFormat: string = 'graphql';

  readonly targetHandler: string = 'console';

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): GraphQLConsoleFormatter<Partial<TTaskContext>, TGlobalContext> {
    return new GraphQLConsoleFormatter<Partial<TTaskContext>, TGlobalContext>();
  }

  injectLogger(): void {}

  getEntryLabel(): string {
    return 'GraphQL request';
  }

  getEntryTitle(entry: GraphQlLogEntry<Partial<TTaskContext>, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    return entry.data.operation || entry.data.query.replace(/{[\s\S]*$/, '').trim();
  }

  formatEntry(entry: GraphQlLogEntry<Partial<TTaskContext>, TGlobalContext>): string {
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
