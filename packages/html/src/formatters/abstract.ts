import type { LogEntry, ReadonlyRecursive, TContextBase, TContextShape } from '@debugr/core';
import { cleanUpStackTrace } from '@debugr/core';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import type { HtmlFormatterPlugin } from './types';

export abstract class AbstractHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements HtmlFormatterPlugin<TTaskContext, TGlobalContext>
{
  public abstract readonly id: string;
  public readonly kind = 'formatter' as const;
  public abstract readonly entryType: string;
  public readonly targetHandler = 'html' as const;
  protected readonly separator: string = '\n            ';

  public getEntryLabel?(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;

  public abstract getEntryTitle(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): string;

  public abstract renderEntry(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): string;

  public renderError(e: Error, compact: boolean = true): string {
    const text = `<strong>${escapeHtml(e.name)}</strong>: ${escapeHtml(e.message)}`;

    if (compact) {
      return e.stack ? this.renderStackTrace(e.stack, text) : `<p>${text}</p>`;
    }

    return this.renderParts(`<p>${text}</p>`, e.stack && this.renderStackTrace(e.stack));
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
