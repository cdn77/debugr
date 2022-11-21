import type {
  EntryType,
  LogEntry,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { cleanUpStackTrace, PluginKind } from '@debugr/core';
import { dim, red } from 'ansi-colors';
import type { ConsoleFormatterPlugin } from './types';

export abstract class AbstractConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements ConsoleFormatterPlugin<TTaskContext, TGlobalContext>
{
  public abstract readonly id: string;
  public readonly kind = PluginKind.Formatter;
  public abstract readonly entryType: EntryType;
  public readonly targetHandler = 'console';

  public abstract formatEntry(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): string;

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
