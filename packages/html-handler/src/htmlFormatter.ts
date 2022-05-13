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
} from '@debugr/core';
import * as templates from './templates';
import { LogEntryQueue } from './types';
import { findDefiningEntry } from './utils';

export class HtmlFormatter<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> extends Formatter<Partial<TContext>, TGlobalContext> {
  readonly templates: FormatterTemplateMap = templates;

  formatQueue(queue: LogEntryQueue<Partial<TContext>, TGlobalContext>): string {
    const definingEntry = findDefiningEntry<Partial<TContext>, TGlobalContext>(queue);

    return this.templates.layout(
      this.levelMap[definingEntry.level] || 'unknown',
      this.getEntryTitle(definingEntry),
      this.formatEntries(queue.entries),
    );
  }

  private formatEntries(entries: LogEntry<Partial<TContext>, TGlobalContext>[]): string {
    const chunks: string[] = [];
    let previous: LogEntry<Partial<TContext>, TGlobalContext> | undefined;

    for (const entry of entries) {
      chunks.push(...this.format(entry, previous?.ts));
      previous = entry;
    }

    return chunks.join('\n');
  }

  private getEntryTitle(entry: LogEntry<Partial<TContext>, TGlobalContext>): string {
    try {
      const plugin = entry.formatId ? this.pluginManager.get(entry.formatId) : undefined;

      if (plugin && !isFormatterPlugin(plugin)) {
        throw new Error(`Invalid plugin: ${entry.formatId} is not a Formatter plugin`);
      }

      return plugin
        ? plugin.getEntryTitle(entry)
        : entry.message || `Unknown ${this.levelMap[entry.level] || 'unknown'}`;
    } catch (e) {
      return entry.message || `Unknown ${this.levelMap[entry.level] || 'unknown'}`;
    }
  }

  protected formatEntry(
    entry: LogEntry<Partial<TContext>, TGlobalContext>,
    previousTs?: ImmutableDate,
    plugin?: FormatterPlugin<Partial<TContext>, TGlobalContext>,
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
