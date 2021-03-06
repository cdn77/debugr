import { escapeHtml, formatData, isEmpty, FormatterPlugin, LogEntry } from '@debugr/core';
import { formatQuery, formatQueryTime } from './utils';

export class SqlFormatter implements FormatterPlugin {
  readonly id: string = 'sql';

  getEntryLabel(): string {
    return 'SQL query';
  }

  formatEntry(entry: LogEntry): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the SqlFormatter plugin');
    }

    const parts: string[] = [];

    if (entry.message) {
      parts.push(`<p>${escapeHtml(entry.message)}</p>`);
    }

    parts.push(`<pre><code class="sql">${escapeHtml(formatQuery(entry.data.query))}</code></pre>`);

    if (
      entry.data.parameters &&
      (Array.isArray(entry.data.parameters)
        ? entry.data.parameters.length
        : !isEmpty(entry.data.parameters))
    ) {
      parts.push(`
      <details>
        <summary>Parameters:</summary>
        <pre><code>${escapeHtml(formatData(entry.data.parameters))}</code></pre>
      </details>`);
    }

    if (typeof entry.data.error === 'string') {
      parts.push(`
      <p><strong>Error:</strong> ${escapeHtml(entry.data.error)}</p>
      `);
    }

    const details: string[] = [];

    if (typeof entry.data.time === 'number') {
      details.push(formatQueryTime(entry.data.time));
    }

    if (typeof entry.data.affectedRows === 'number') {
      details.push(`<strong>${entry.data.affectedRows}</strong> affected rows`);
    }

    if (typeof entry.data.rows === 'number') {
      details.push(`<strong>${entry.data.rows}</strong> rows`);
    }

    if (details.length) {
      parts.push(`<p class="text-muted"><small>${details.join(' | ')}</small></p>`);
    }

    return parts.join('');
  }
}
