import {
  LogEntry,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
  cleanUpStackTrace,
} from '@debugr/core';
import { dim, red } from 'ansi-colors';
import { ConsoleFormatterPlugin } from './types';

export abstract class AbstractConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements ConsoleFormatterPlugin<TTaskContext, TGlobalContext>
{
  abstract readonly id: string;

  abstract readonly entryFormat: string;

  readonly targetHandler: 'console' = 'console';

  injectLogger() {}

  abstract formatEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;

  public formatError(error: Error): string {
    return this.formatParts(
      `${red(error.name)}: ${error.message}`,
      error.stack && dim(cleanUpStackTrace(error.stack)),
    );
  }

  protected formatParts(separator: string, parts: any[]): string;
  protected formatParts(...parts: any[]): string;
  protected formatParts(...parts: any[]): string {
    const [separator, partz] =
      parts.length === 2 && typeof parts[0] === 'string' && Array.isArray(parts[1])
        ? parts
        : ['\n', parts];

    return partz.filter((p: any) => typeof p === 'string' && p.length > 0).join(separator);
  }
}
