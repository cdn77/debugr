import type {
  HandlerPlugin,
  LogEntry,
  Logger,
  PluginManager,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel } from '@debugr/core';
import { ConsoleFormatter } from './consoleFormatter';
import type { ConsoleHandlerOptions } from './types';

export class ConsoleHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements HandlerPlugin<TTaskContext, TGlobalContext>
{
  public readonly id: string = 'console';
  public readonly kind = 'handler' as const;
  private readonly options: ConsoleHandlerOptions;
  private readonly threshold: LogLevel | number;
  private formatter?: ConsoleFormatter<TTaskContext, TGlobalContext>;

  public constructor(
    options: ConsoleHandlerOptions = {},
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
        this.options.timestamp,
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
