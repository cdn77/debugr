import type { TContextBase, TContextShape } from '@debugr/core';
import { formatData, isEmpty } from '@debugr/core';
import type { SqlLogEntry, SqlQueryFormatter } from '@debugr/sql-common';
import { createQueryFormatter, formatQueryTime } from '@debugr/sql-common';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import { AbstractHtmlFormatter } from './abstract';

export class SqlHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHtmlFormatter<TTaskContext, TGlobalContext> {
  public readonly id: string = 'debugr-sql-html-formatter';

  public readonly entryFormat: string = 'sql';

  private readonly formatQuery: SqlQueryFormatter;

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): SqlHtmlFormatter<TTaskContext, TGlobalContext> {
    return new SqlHtmlFormatter<TTaskContext, TGlobalContext>();
  }

  constructor() {
    super();
    this.formatQuery = createQueryFormatter();
  }

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

  renderEntry(entry: SqlLogEntry<TTaskContext, TGlobalContext>): string {
    if (!entry.data || !entry.data.query) {
      throw new Error('This entry cannot be formatted by the SqlFormatter plugin');
    }

    const parameters =
      entry.data.parameters &&
      (Array.isArray(entry.data.parameters)
        ? entry.data.parameters.length
        : !isEmpty(entry.data.parameters))
        ? entry.data.parameters
        : undefined;

    const details = this.renderParts(' | ', [
      typeof entry.data.time === 'number' && formatQueryTime(entry.data.time, true),
      typeof entry.data.affectedRows === 'number' &&
        `<strong>${entry.data.affectedRows}</strong> rows affected`,
      typeof entry.data.rows === 'number' && `<strong>${entry.data.rows}</strong> rows`,
    ]);

    return this.renderParts(
      entry.message && `<p>${escapeHtml(entry.message)}</p>`,
      renderCode(this.formatQuery(entry.data.query), 'sql'),
      parameters && renderDetails('Parameters:', renderCode(formatData(entry.data.parameters))),
      entry.data.error && `<p><strong>Error:</strong> ${escapeHtml(entry.data.error)}</p>`,
      details && `<p class="text-muted"><small>${details}</small></p>`,
    );
  }
}
