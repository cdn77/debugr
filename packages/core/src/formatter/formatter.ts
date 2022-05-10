import { LogEntry, LogLevel, ImmutableDate } from '../logger/types';
import { FormatterPlugin, isFormatterPlugin, PluginManager } from '../plugins';

export abstract class Formatter {
  readonly levelMap: Record<number, string> = {
    [-1]: 'internal',
    [LogLevel.TRACE]: 'trace',
    [LogLevel.DEBUG]: 'debug',
    [LogLevel.INFO]: 'info',
    [LogLevel.WARNING]: 'warning',
    [LogLevel.ERROR]: 'error',
    [LogLevel.FATAL]: 'fatal',
  };

  protected readonly pluginManager: PluginManager;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
  }

  protected abstract formatEntry(
    entry: LogEntry,
    previousTs?: ImmutableDate,
    plugin?: FormatterPlugin,
  ): string;

  protected abstract formatError(e: Error, message: string): string;

  *format(entry: LogEntry, previousTs?: ImmutableDate): Generator<string> {
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

  private tryFormatEntry(
    entry: LogEntry,
    previousTs?: ImmutableDate,
    noPlugin: boolean = false,
  ): string {
    const plugin = !noPlugin && entry.pluginId ? this.pluginManager.get(entry.pluginId) : undefined;

    if (plugin && !isFormatterPlugin(plugin)) {
      throw new Error(`Invalid plugin: ${entry.pluginId} is not a Formatter plugin`);
    }

    return this.formatEntry(entry, previousTs, plugin);
  }
}
