import type {
  LogEntry,
Logger,  LogHandlerPlugin,
  PluginManager,
  ReadonlyRecursive,
  TContextBase,
  TContextShape
} from '@debugr/core';
import { LogLevel } from '@debugr/core';
import { ConsoleFormatter } from './consoleFormatter';
import type { ConsoleLogHandlerOptions } from './types';

export class ConsoleLogHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements LogHandlerPlugin<TTaskContext, TGlobalContext> {
  public readonly id: string = 'console';

  private readonly options: ConsoleLogHandlerOptions;

  private readonly threshold: LogLevel | number;

  private formatter?: ConsoleFormatter<TTaskContext, TGlobalContext>;

  public constructor(
    options: ConsoleLogHandlerOptions = {},
    formatter?: ConsoleFormatter<TTaskContext, TGlobalContext>,
  ) {
    this.options = options;
    this.threshold = options.threshold ?? LogLevel.INFO;
    this.formatter = formatter;
  }

  public injectLogger(
    logger: Logger<TTaskContext, TGlobalContext>,
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
  ): void {
    if (!this.formatter) {
      this.formatter = new ConsoleFormatter<TTaskContext, TGlobalContext>(
        pluginManager,
        this.options.levelMap,
        this.options.colorMap,
        this.options.writeTimestamp,
      );
    }
  }

  public log(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): void {
    if (!this.formatter) {
      throw new Error('Logger was incorrectly initialized, no formatter found');
    } else if (entry.level < this.threshold) {
      return;
    }

    console.log(this.formatter.format(entry));
  }
}
