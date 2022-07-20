import {
  formatData,
  isEmpty,
  FormatterPlugin,
  TContextBase,
  TContextShape,
  SqlLogEntry,
} from '@debugr/core';
import { escapeHtml, renderCode, renderDetails } from '../templates';

export class SqlHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<TTaskContext, TGlobalContext>
{
  public readonly id: string = 'sql-html';

  public readonly entryFormat: string = 'sql';

  public readonly targetHandler: string = 'html';

  private readonly formatQuery: QueryFormatter;

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): SqlHtmlFormatter<TTaskContext, TGlobalContext> {
    return new SqlHtmlFormatter<TTaskContext, TGlobalContext>();
  }

  constructor() {
    this.formatQuery = createQueryFormatter();
  }

  injectLogger(): void {}

  getEntryLabel(): string {
    return 'SQL query';
  }

  getEntryTitle(entry: SqlLogEntry<TTaskContext, TGlobalContext>): string {
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

  formatEntry(entry: SqlLogEntry<TTaskContext, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the SqlFormatter plugin');
    }

    const parts: string[] = [];

    if (entry.message) {
      parts.push(`<p>${escapeHtml(entry.message)}</p>`);
    }

    parts.push(renderCode(this.formatQuery(entry.data.query), 'sql'));

    if (
      entry.data.parameters &&
      (Array.isArray(entry.data.parameters)
        ? entry.data.parameters.length
        : !isEmpty(entry.data.parameters))
    ) {
      parts.push(renderDetails('Parameters:', renderCode(formatData(entry.data.parameters))));
    }

    if (typeof entry.data.error === 'string') {
      parts.push(`<p><strong>Error:</strong> ${escapeHtml(entry.data.error)}</p>`);
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

    return parts.join('\n            ');
  }
}

type QueryFormatter = (query: string) => string;

function createQueryFormatter(): QueryFormatter {
  try {
    // eslint-disable-next-line global-require
    const { format } = require('@sqltools/formatter');
    return (query) => format(query, { language: 'sql', reservedWordCase: 'upper' });
  } catch (e) {
    return (query) => query;
  }
}

function formatQueryTime(ms: number, html: boolean = false): string {
  const value = ms > 1000 ? ms / 1000 : ms;
  const unit = ms > 1000 ? 's' : 'ms';
  const [p, s] = html ? ['<strong>', '</strong>'] : ['', ''];
  return `${p}${value.toFixed(2)}${s} ${unit}`;
}
