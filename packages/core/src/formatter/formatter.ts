import { FormatterPlugin, isFormatterPlugin, PluginManager } from '../plugins';
import { LogEntry } from '../queues';
import { LogLevel } from '../types';

export abstract class Formatter {
  readonly levelMap: Record<number, string> = {
    [-1]: 'internal',
    [LogLevel.DEBUG]: 'debug',
    [LogLevel.INFO]: 'info',
    [LogLevel.WARNING]: 'warning',
    [LogLevel.ERROR]: 'error',
  };

  protected readonly pluginManager: PluginManager;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
  }

  protected abstract formatEntry(
    entry: LogEntry,
    previousTs?: number,
    plugin?: FormatterPlugin,
  ): string;

  protected abstract formatError(e: Error, message: string): string;

  *format(entry: LogEntry, previousTs?: number): Generator<string> {
    try {
      yield this.tryFormatEntry(entry, previousTs);
    } catch (e) {
      try {
        const content = this.tryFormatEntry(entry, previousTs, true);
        yield this.formatError(e, 'An error occurred while formatting the next log entry:');
        yield content;
      } catch (e2) {
        yield this.formatError(e, 'Error formatting log entry:');
      }
    }
  }

  private tryFormatEntry(entry: LogEntry, previousTs?: number, noPlugin: boolean = false): string {
    const plugin = !noPlugin && entry.plugin ? this.pluginManager.get(entry.plugin) : undefined;

    if (plugin && !isFormatterPlugin(plugin)) {
      throw new Error(`Invalid plugin: ${entry.plugin} is not a Formatter plugin`);
    }

    return this.formatEntry(entry, previousTs, plugin);
  }
}
