import { formatData, isEmpty, TContextBase, TContextShape } from '@debugr/core';
import {
  createQueryFormatter,
  formatQueryTime,
  SqlLogEntry,
  SqlQueryFormatter,
} from '@debugr/sql-common';
import { dim } from 'ansi-colors';
import { AbstractConsoleFormatter } from './abstract';

export class SqlConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-sql-console-formatter';

  readonly entryFormat: string = 'sql';

  private readonly formatQuery: SqlQueryFormatter;

  constructor() {
    super();
    this.formatQuery = createQueryFormatter();
  }

  formatEntry(entry: SqlLogEntry<TTaskContext, TGlobalContext>): string {
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
