import { escapeHtml, formatData, FormatterPlugin, isEmpty, LogEntry } from '@debugr/core';

export class GraphQLFormatter implements FormatterPlugin {
  readonly id: string = 'graphql';

  getEntryLabel(): string {
    return 'GraphQL request';
  }

  formatHtmlEntry(entry: LogEntry): string {
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

  formatConsoleEntry(entry: LogEntry): string {
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
