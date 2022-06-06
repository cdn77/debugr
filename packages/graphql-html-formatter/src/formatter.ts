import {
  escapeHtml,
  formatData,
  FormatterPlugin,
  isEmpty,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { GraphQlLogEntry } from '@debugr/apollo';

export class GraphQLHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<Partial<TTaskContext>, TGlobalContext>
{
  readonly id: string = 'graphql';

  readonly entryFormat: string = 'graphql';

  readonly targetHandler: string = 'html';

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): GraphQLHtmlFormatter<Partial<TTaskContext>, TGlobalContext> {
    return new GraphQLHtmlFormatter<Partial<TTaskContext>, TGlobalContext>();
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
      parts.push(`
        <p>
          <strong>Operation:</strong>
          <span class="mono">${escapeHtml(entry.data.operation)}</span>
        </p>
      `);
    }

    parts.push(`
      <details>
        <summary>Query:</summary>
        <pre><code class="graphql">${escapeHtml(entry.data.query)}</code></pre>
      </details>
    `);

    if (!isEmpty(entry.data.variables)) {
      parts.push(`
        <details>
          <summary>Variables:</summary>
          <pre><code>${escapeHtml(formatData(entry.data.variables))}</code></pre>
        </details>
      `);
    }

    return parts.join('');
  }
}
