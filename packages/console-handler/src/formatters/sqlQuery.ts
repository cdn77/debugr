import type { TContextBase, TContextShape } from '@debugr/core';
import { formatData, isEmpty } from '@debugr/core';
import type { SqlQueryFormatter,SqlQueryLogEntry } from '@debugr/sql-common';
import { createQueryFormatter, formatQueryTime } from '@debugr/sql-common';
import { dim } from 'ansi-colors';
import { AbstractConsoleFormatter } from './abstract';

export class SqlQueryConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-sql-query-console-formatter';

  readonly entryType: string = 'sql';

  private readonly formatQuery: SqlQueryFormatter;

  constructor() {
    super();
    this.formatQuery = createQueryFormatter();
  }

  formatEntry(entry: SqlQueryLogEntry<TTaskContext, TGlobalContext>): string {
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
      dim(this.formatQuery(entry.data.query)),
      parameters && dim(`Parameters:\n${formatData(parameters)}`),
      typeof entry.data.error === 'string' && `Error: ${entry.data.error}`,
      details && dim(`(${details})`),
    );
  }
}
