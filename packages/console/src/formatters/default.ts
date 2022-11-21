import type { LogEntry, ReadonlyRecursive, TContextBase, TContextShape } from '@debugr/core';
import { EntryType, formatData, isEmpty } from '@debugr/core';
import { dim } from 'ansi-colors';
import { AbstractConsoleFormatter } from './abstract';

export class DefaultConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  public readonly id = 'debugr-default-console-formatter';
  public readonly entryType = EntryType.Any;

  public formatEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string {
    const data = isEmpty(entry.data) ? undefined : entry.data;

    return this.formatParts(
      entry.message,
      data && !entry.message && 'Data:',
      data && dim(formatData(data)),
      entry.error && this.formatError(entry.error),
    );
  }
}
