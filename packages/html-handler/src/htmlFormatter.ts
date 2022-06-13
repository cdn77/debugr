import {
  FormatterTemplateMap,
  Formatter,
  FormatterPlugin,
  isFormatterPlugin,
  LogEntry,
  escapeHtml,
  isEmpty,
  formatData,
  pad,
  pad3,
  ImmutableDate,
  TContextBase,
  TContextShape,
  ReadonlyRecursive,
} from '@debugr/core';
import * as templates from './templates';
import { LogEntryQueue } from './types';
import { findDefiningEntry } from './utils';

export class HtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends Formatter<Partial<TTaskContext>, TGlobalContext> {
  readonly templates: FormatterTemplateMap = templates;

  formatQueue(queue: LogEntryQueue<Partial<TTaskContext>, TGlobalContext>): string {
    const definingEntry = findDefiningEntry<Partial<TTaskContext>, TGlobalContext>(queue);

    return this.templates.layout(
      this.levelMap[definingEntry.level] || 'unknown',
      this.getEntryTitle(definingEntry),
      this.formatEntries(queue.entries),
    );
  }

  private formatEntries(
    entries: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>>[],
  ): string {
    const chunks: string[] = [];
    let previous: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>> | undefined;

    for (const entry of entries) {
      chunks.push(...this.format(entry, previous?.ts));
      previous = entry;
    }

    return chunks.join('\n');
  }

  private getEntryTitle(
    entry: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>>,
  ): string {
    try {
      const plugin = entry.format ? this.pluginManager.get(entry.format) : undefined;

      if (plugin && !isFormatterPlugin(plugin)) {
        throw new Error(`Invalid plugin: ${entry.format} is not a Formatter plugin`);
      }

      return plugin
        ? plugin.getEntryTitle(entry)
        : entry.message || `Unknown ${this.levelMap[entry.level] || 'unknown'}`;
    } catch (e) {
      return entry.message || `Unknown ${this.levelMap[entry.level] || 'unknown'}`;
    }
  }

  protected formatEntry(
    entry: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>>,
    previousTs?: ImmutableDate,
    plugin?: FormatterPlugin<Partial<TTaskContext>, TGlobalContext>,
  ): string {
    return this.templates.entry(
      formatDate(entry.ts, previousTs),
      this.levelMap[entry.level] || 'unknown',
      plugin ? plugin.getEntryLabel(entry) : '',
      plugin ? plugin.formatEntry(entry) : formatDefaultContent(entry.message, entry.data),
    );
  }

  protected formatError(e: Error, message: string): string {
    return this.templates.entry(
      '',
      'internal',
      '',
      formatDefaultContent(`${message} ${e.message}`, { stack: e.stack }),
    );
  }
}

function formatDate(ts: ImmutableDate, relativeTo?: ImmutableDate): string {
  const str = `${
    !relativeTo ? `${ts.getDate()}/${ts.getMonth() + 1} ${ts.getFullYear()} ` : ''
  }${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(ts.getSeconds())}<small>.${pad3(
    ts.getMilliseconds(),
  )}</small>`;

  return relativeTo ? `${str} <small>(+${ts.getTime() - relativeTo.getTime()}ms)</small>` : str;
}

function formatStack(stack: string): string {
  return `
    <details>
      <summary>Stack trace:</summary>
      <pre><code>${escapeHtml(stack)}</code></pre>
    </details>
  `;
}

function formatDefaultContent(message?: string, data?: any): string {
  const { stack, ...otherData } = data || {};
  const formattedData = !isEmpty(otherData)
    ? `<pre><code>${escapeHtml(formatData(otherData))}</code></pre>`
    : null;

  const wrappedData = () => `
    <details>
      <summary>Data:</summary>
      ${formattedData}
    </details>
  `;

  return `
    ${message ? `<p>${escapeHtml(message)}</p>` : ''}
    ${formattedData ? (!message ? formattedData : wrappedData()) : ''}
    ${typeof stack === 'string' ? formatStack(stack) : ''}
  `;
}
