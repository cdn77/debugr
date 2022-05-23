import {
  escapeHtml,
  formatData,
  isEmpty,
  FormatterPlugin,
  LogEntry,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { formatQueryTime } from './utils';

export class SqlHtmlFormatter<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<Partial<TTaskContext>, TGlobalContext>
{
  public readonly id: string = 'sql';

  public readonly entryFormat: string = 'sql';

  public readonly handlerSupport: string = 'html';

  injectLogger(): void {}

  getEntryLabel(): string {
    return 'SQL query';
  }

  getEntryTitle(entry: LogEntry): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the SqlFormatter plugin');
    }

    if (entry.message) {
      return entry.message;
    } else if (typeof entry.data.error === 'string') {
      return entry.data.error;
    } else {
      return entry.data.query;
    }
  }

  formatEntry(entry: LogEntry): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the SqlFormatter plugin');
    }

    const parts: string[] = [];

    if (entry.message) {
      parts.push(`<p>${escapeHtml(entry.message)}</p>`);
    }

    parts.push(`<pre><code class="sql">${escapeHtml(entry.data.query)}</code></pre>`);

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
      details.push(formatQueryTime(entry.data.time, true));
    }

    if (typeof entry.data.affectedRows === 'number') {
      details.push(`<strong>${entry.data.affectedRows}</strong> rows affected`);
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
