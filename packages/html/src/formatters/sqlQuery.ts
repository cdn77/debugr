import type { TContextBase, TContextShape } from '@debugr/core';
import { formatData, isEmpty } from '@debugr/core';
import type { SqlQueryFormatter, SqlQueryLogEntry } from '@debugr/sql-common';
import { createQueryFormatter, formatQueryTime } from '@debugr/sql-common';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import { AbstractHtmlFormatter } from './abstract';

export class SqlQueryHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHtmlFormatter<TTaskContext, TGlobalContext> {
  public readonly id: string = 'debugr-sql-query-html-formatter';
  public readonly entryType: string = 'sql.query';

  private readonly formatQuery: SqlQueryFormatter;

  public constructor() {
    super();
    this.formatQuery = createQueryFormatter();
  }

  public getEntryLabel(): string {
    return 'SQL query';
  }

  public getEntryTitle(entry: SqlQueryLogEntry<TTaskContext, TGlobalContext>): string {
    if (entry.message) {
      return entry.message;
    } else if (typeof entry.data.error === 'string') {
      return entry.data.error;
    } else {
      return entry.data.query;
    }
  }

  public renderEntry(entry: SqlQueryLogEntry<TTaskContext, TGlobalContext>): string {
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
