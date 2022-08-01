import {
  LogEntry,
  LogHandler,
  LogLevel,
  PluginManager,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { ConsoleFormatter } from './consoleFormatter';
import { ConsoleLogHandlerOptions } from './types';

export class ConsoleLogHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogHandler<TTaskContext, TGlobalContext> {
  public readonly threshold: LogLevel | number;

  public readonly identifier: string = 'console';

  public readonly doesNeedFormatters: boolean = true;

  private readonly options: ConsoleLogHandlerOptions;

  private formatter?: ConsoleFormatter<TTaskContext, TGlobalContext>;

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: ConsoleLogHandlerOptions,
  ): ConsoleLogHandler<TTaskContext, TGlobalContext> {
    return new ConsoleLogHandler<TTaskContext, TGlobalContext>(options);
  }

  public constructor(
    options: ConsoleLogHandlerOptions = {},
    formatter?: ConsoleFormatter<TTaskContext, TGlobalContext>,
  ) {
    super();
    this.threshold = options.threshold ?? LogLevel.INFO;
    this.options = options;
    this.formatter = formatter;
  }

  public injectPluginManager(pluginManager: PluginManager<TTaskContext, TGlobalContext>): void {
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
    }

    console.log(this.formatter.format(entry));
  }
}
