import {
  formatData,
  FormatterPlugin,
  isEmpty,
  TContextBase,
  TContextShape,
  GraphQlLogEntry,
} from '@debugr/core';
import { escapeHtml, renderCode, renderDetails } from '../templates';

export class GraphQLHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<TTaskContext, TGlobalContext>
{
  readonly id: string = 'graphql-html';

  readonly entryFormat: string = 'graphql';

  readonly targetHandler: string = 'html';

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): GraphQLHtmlFormatter<TTaskContext, TGlobalContext> {
    return new GraphQLHtmlFormatter<TTaskContext, TGlobalContext>();
  }

  injectLogger(): void {}

  getEntryLabel(): string {
    return 'GraphQL request';
  }

  getEntryTitle(entry: GraphQlLogEntry<TTaskContext, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    return entry.data.operation || entry.data.query.replace(/{[\s\S]*$/, '').trim();
  }

  formatEntry(entry: GraphQlLogEntry<TTaskContext, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the GraphQLFormatter plugin');
    }

    const parts: string[] = [];

    if (entry.data.operation) {
      parts.push(`<p>
            <strong>Operation:</strong>
            <span class="mono">${escapeHtml(entry.data.operation)}</span>
          </p>`);
    }

    parts.push(renderDetails('Query:', renderCode(entry.data.query, 'graphql')));

    if (!isEmpty(entry.data.variables)) {
      parts.push(renderDetails('Variables:', renderCode(formatData(entry.data.variables))));
    }

    return parts.join('\n            ');
  }
}
