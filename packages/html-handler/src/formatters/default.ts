import {
  formatData,
  isEmpty,
  LogEntry,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
  levelToValue,
} from '@debugr/core';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import { AbstractHtmlFormatter } from './abstract';

export class DefaultHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends AbstractHtmlFormatter<TTaskContext, TGlobalContext> {
  private readonly levelMap: Map<number, string>;

  readonly id: string = 'debugr-default-html-formatter';

  readonly entryFormat: string = '*';

  readonly targetHandler: 'html' = 'html';

  constructor(levelMap: Map<number, string>) {
    super();
    this.levelMap = levelMap;
  }

  getEntryTitle(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string {
    if (entry.message) {
      return entry.message;
    }

    if (entry.error && entry.error.message) {
      return entry.error.message;
    }

    return `Unknown ${levelToValue(this.levelMap, entry.level, 'entry')}`;
  }

  renderEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string {
    const message = entry.message && escapeHtml(entry.message);
    const data = !isEmpty(entry.data) && renderCode(formatData(entry.data));

    return this.renderParts(
      message && data && renderDetails(message, data),
      message && `<p>${message}</p>`,
      data && renderDetails('Data:', data),
      entry.error && this.renderError(entry.error, false),
    );
  }
}
