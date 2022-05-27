import {
  formatData,
  isEmpty,
  FormatterPlugin,
  LogEntry,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { dim } from 'ansi-colors';
import { formatQueryTime } from './utils';

export class SqlConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<Partial<TTaskContext>, TGlobalContext>
{
  public readonly id: string = 'sql';

  public readonly entryFormat: string = 'sql';

  public readonly handlerSupport: string = 'console';

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): SqlConsoleFormatter<Partial<TTaskContext>, TGlobalContext> {
    return new SqlConsoleFormatter<Partial<TTaskContext>, TGlobalContext>();
  }

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
      parts.push(entry.message);
    }

    parts.push(dim(entry.data.query));

    if (
      entry.data.parameters &&
      (Array.isArray(entry.data.parameters)
        ? entry.data.parameters.length
        : !isEmpty(entry.data.parameters))
    ) {
      parts.push('Parameters:', dim(formatData(entry.data.parameters)));
    }

    if (typeof entry.data.error === 'string') {
      parts.push(`Error: ${entry.data.error}`);
    }

    const details: string[] = [];

    if (typeof entry.data.time === 'number') {
      details.push(`time: ${formatQueryTime(entry.data.time)}`);
    }

    if (typeof entry.data.affectedRows === 'number') {
      details.push(`${entry.data.affectedRows} rows affected`);
    }

    if (typeof entry.data.rows === 'number') {
      details.push(`${entry.data.rows} rows`);
    }

    if (details.length) {
      parts.push(dim(`(${details.join(' | ')})`));
    }

    return parts.join('\n');
  }
}
