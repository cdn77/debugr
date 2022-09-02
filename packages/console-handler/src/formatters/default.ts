import type {
  LogEntry,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { formatData, isEmpty } from '@debugr/core';
import { dim } from 'ansi-colors';
import { AbstractConsoleFormatter } from './abstract';

export class DefaultConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-default-console-formatter';

  readonly entryFormat: string = '*';

  formatEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string {
    const data = isEmpty(entry.data) ? undefined : entry.data;

    return this.formatParts(
      entry.message,
      data && !entry.message && 'Data:',
      data && dim(formatData(data)),
      entry.error && this.formatError(entry.error),
    );
  }
}
