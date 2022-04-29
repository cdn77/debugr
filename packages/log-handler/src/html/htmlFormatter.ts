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
      const plugin = entry.plugin ? this.pluginManager.get(entry.plugin) : undefined;

      if (plugin && !isFormatterPlugin(plugin)) {
        throw new Error(`Invalid plugin: ${entry.plugin} is not a Formatter plugin`);
      }

      return plugin
        ? plugin.getEntryTitle(entry)
        : entry.message || `Unknown ${this.levelMap[entry.level] || 'unknown'}`;
    } catch (e) {
      return entry.message || `Unknown ${this.levelMap[entry.level] || 'unknown'}`;
    }
  }

  protected formatEntry(entry: LogEntry, previousTs?: number, plugin?: FormatterPlugin): string {
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

function formatDate(ts: number, relativeTo?: number): string {
  const d = new Date(ts);
  const str = `${!relativeTo ? `${d.getDate()}/${d.getMonth() + 1} ${d.getFullYear()} ` : ''}${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}<small>.${pad3(d.getMilliseconds())}</small>`;

  return relativeTo ? `${str} <small>(+${d.getTime() - relativeTo}ms)</small>` : str;
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
