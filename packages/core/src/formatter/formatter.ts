import { isFormatterPlugin, PluginManager } from '../plugins';
import { findDefiningEntry, LogEntry, LogEntryQueue } from '../queues';
import { extractEntryTitle, formatDate, formatDefaultContent } from './utils';
import { FormatterTemplateMap } from './types';
import { LogLevel } from '../types';
import * as templates from './templates';

export class Formatter {
  readonly levelMap: Record<number, string> = {
    [-1]: 'internal',
    [LogLevel.DEBUG]: 'debug',
    [LogLevel.INFO]: 'info',
    [LogLevel.WARNING]: 'warning',
    [LogLevel.ERROR]: 'error',
  };

  readonly templates: FormatterTemplateMap = templates;

  private readonly pluginManager: PluginManager;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
  }

  format(queue: LogEntryQueue): string {
    const definingEntry = findDefiningEntry(queue);

    return this.templates.layout(
      this.levelMap[definingEntry.level] || 'unknown',
      extractEntryTitle(definingEntry, this.levelMap),
      this.formatEntries(queue.entries),
    );
  }

  private formatEntries(entries: LogEntry[]): string {
    const chunks: string[] = [];
    let previous: LogEntry | undefined;

    for (const entry of entries) {
      try {
        chunks.push(this.formatEntry(entry, previous));
      } catch (e) {
        try {
          const content = this.formatEntry(entry, previous, true);
          chunks.push(
            this.formatError(e, 'An error occurred while formatting the next log entry:'),
          );
          chunks.push(content);
        } catch (e2) {
          chunks.push(this.formatError(e, 'Error formatting log entry:'));
        }
      }

      previous = entry;
    }

    return chunks.join('\n');
  }

  private formatError(e: Error, message: string): string {
    return this.templates.entry(
      '',
      'internal',
      '',
      formatDefaultContent(`${message} ${e.message}`, { stack: e.stack }),
    );
  }

  private formatEntry(entry: LogEntry, previous?: LogEntry, noPlugin: boolean = false): string {
    const plugin = !noPlugin && entry.plugin ? this.pluginManager.get(entry.plugin) : undefined;

    if (plugin && !isFormatterPlugin(plugin)) {
      throw new Error(`Invalid plugin: ${entry.plugin} is not a Formatter plugin`);
    }

    return this.templates.entry(
      formatDate(entry.ts, previous?.ts),
      this.levelMap[entry.level] || 'unknown',
      plugin ? plugin.getEntryLabel(entry) : '',
      plugin ? plugin.formatEntry(entry) : formatDefaultContent(entry.message, entry.data),
    );
  }
}
