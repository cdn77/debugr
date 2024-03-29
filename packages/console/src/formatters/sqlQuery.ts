import type { TContextBase, TContextShape } from '@debugr/core';
import { EntryType, formatData, isEmpty } from '@debugr/core';
import type { SqlQueryFormatter, SqlQueryLogEntry } from '@debugr/sql-common';
import { createQueryFormatter, formatQueryTime } from '@debugr/sql-common';
import type { ConsoleStyle } from '../types';
import { AbstractConsoleFormatter } from './abstract';

export class SqlQueryConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  public readonly id = 'debugr-sql-query-console-formatter';
  public readonly entryType = EntryType.SqlQuery;

  private readonly formatQuery: SqlQueryFormatter;

  public constructor() {
    super();
    this.formatQuery = createQueryFormatter();
  }

  public formatEntry(
    entry: SqlQueryLogEntry<TTaskContext, TGlobalContext>,
    style: ConsoleStyle,
  ): string {
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

    const details = this.formatParts(' | ', [
      typeof entry.data.time === 'number' && `time: ${formatQueryTime(entry.data.time)}`,
      typeof entry.data.affectedRows === 'number' && `${entry.data.affectedRows} rows affected`,
      typeof entry.data.rows === 'number' && `${entry.data.rows} rows`,
    ]);

    return this.formatParts(
      entry.message,
      style.dim(this.formatQuery(entry.data.query)),
      parameters && style.dim(`Parameters:\n${formatData(parameters)}`),
      typeof entry.data.error === 'string' && `Error: ${entry.data.error}`,
      details && style.dim(`(${details})`),
    );
  }
}
