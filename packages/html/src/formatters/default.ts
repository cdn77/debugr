import type { LogEntry, ReadonlyRecursive, TContextBase, TContextShape } from '@debugr/core';
import { formatData, isEmpty, levelToValue } from '@debugr/core';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import { AbstractHtmlFormatter } from './abstract';

export class DefaultHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHtmlFormatter<TTaskContext, TGlobalContext> {
  public readonly id: string = 'debugr-default-html-formatter';
  public readonly entryType: string = '*';
  public readonly targetHandler = 'html' as const;
  private readonly levelMap: Map<number, string>;

  public constructor(levelMap: Map<number, string>) {
    super();
    this.levelMap = levelMap;
  }

  public getEntryTitle(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string {
    if (entry.message) {
      return entry.message;
    }

    if (entry.error && entry.error.message) {
      return entry.error.message;
    }

    return `Unknown ${levelToValue(this.levelMap, entry.level, 'entry')}`;
  }

  public renderEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string {
    const message = entry.message && escapeHtml(entry.message);
    const data = !isEmpty(entry.data) && renderCode(formatData(entry.data));

    return this.renderParts(
      data ? renderDetails(message || 'Data:', data) : message && `<p>${message}</p>`,
      entry.error && this.renderError(entry.error, false),
    );
  }
}
