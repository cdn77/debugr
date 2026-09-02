import type {
  EntryType,
  LogEntry,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { cleanUpStackTrace, PluginKind } from '@debugr/core';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import type { HtmlFormatterPlugin } from './types';

export abstract class AbstractHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements HtmlFormatterPlugin<TTaskContext, TGlobalContext> {
  public abstract readonly id: string;
  public readonly kind = PluginKind.Formatter;
  public abstract readonly entryType: EntryType;
  public readonly targetHandler = 'html';

  protected readonly separator: string = '\n            ';

  public getEntryLabel?(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;

  public abstract getEntryTitle(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): string;

  public abstract renderEntry(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): string;

  public renderError(e: Error, compact: boolean = true): string {
    const parts: string[] = [];
    const visited: WeakSet<Error> = new WeakSet();
    let err: Error | undefined = e;
    let prefix: string = '';

    while (err) {
      if (visited.has(err)) {
        parts.push('<p><em>(**recursion**)</em></p>');
        break;
      }

      visited.add(err);
      const text = `${prefix}<strong>${escapeHtml(err.name)}</strong>: ${escapeHtml(err.message)}`;

      parts.push(
        compact
          ? err.stack
            ? this.renderStackTrace(err.stack, text)
            : `<p>${text}</p>`
          : this.renderParts(`<p>${text}</p>`, err.stack && this.renderStackTrace(err.stack)),
      );

      err = 'cause' in err && err.cause instanceof Error ? err.cause : undefined;
      prefix = '⤷ Caused by: ';
    }

    return this.renderParts(...parts);
  }

  public renderStackTrace(trace: string, label: string = 'Stack trace:'): string {
    return renderDetails(label, renderCode(cleanUpStackTrace(trace)));
  }

  protected renderParts(separator: string, parts: any[]): string;
  protected renderParts(...parts: any[]): string;
  protected renderParts(...parts: any[]): string {
    const [separator, partz] =
      parts.length === 2 && typeof parts[0] === 'string' && Array.isArray(parts[1])
        ? parts
        : [this.separator, parts];

    return partz.filter((p: any) => typeof p === 'string' && p.length > 0).join(separator);
  }
}
