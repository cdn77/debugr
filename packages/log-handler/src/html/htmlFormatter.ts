import {
  FormatterTemplateMap,
  Formatter,
  FormatterPlugin,
  isFormatterPlugin,
  LogEntry,
} from '@debugr/core';
import { escapeHtml, isEmpty, formatData, pad, pad3 } from '@debugr/core/src/formatter/utils';
import * as templates from './templates';
import { LogEntryQueue } from './types';
import { findDefiningEntry } from './utils';

export class HtmlFormatter extends Formatter {
  readonly templates: FormatterTemplateMap = templates;

  formatQueue(queue: LogEntryQueue): string {
    const definingEntry = findDefiningEntry(queue);

    return this.templates.layout(
      this.levelMap[definingEntry.level] || 'unknown',
      this.getEntryTitle(definingEntry),
      this.formatEntries(queue.entries),
    );
  }

  private formatEntries(entries: LogEntry[]): string {
    const chunks: string[] = [];
    let previous: LogEntry | undefined;

    for (const entry of entries) {
      chunks.push(...this.format(entry, previous?.ts));
      previous = entry;
    }

    return chunks.join('\n');
  }

  private getEntryTitle(entry: LogEntry): string {
    try {
      const plugin = entry.pluginId ? this.pluginManager.get(entry.pluginId) : undefined;

      if (plugin && !isFormatterPlugin(plugin)) {
        throw new Error(`Invalid plugin: ${entry.pluginId} is not a Formatter plugin`);
      }

      return plugin
        ? plugin.getEntryTitle(entry)
        : entry.message || `Unknown ${this.levelMap[entry.level] || 'unknown'}`;
    } catch (e) {
      return entry.message || `Unknown ${this.levelMap[entry.level] || 'unknown'}`;
    }
  }

  protected formatEntry(entry: LogEntry, previousTs?: Date, plugin?: FormatterPlugin): string {
    return this.templates.entry(
      formatDate(entry.ts, previousTs),
      this.levelMap[entry.level] || 'unknown',
      plugin ? plugin.getEntryLabel(entry) : '',
      plugin ? plugin.formatHtmlEntry(entry) : formatDefaultContent(entry.message, entry.data),
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

function formatDate(ts: Date, relativeTo?: Date): string {
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
