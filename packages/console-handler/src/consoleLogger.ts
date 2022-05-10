import { LogEntry, LogLevel, TContextBase, LogHandler, PluginManager } from '@debugr/core';

import { ConsoleFormatter } from './consoleFormatter';

export class ConsoleLogger<
  TContext extends TContextBase,
  TGlobalContext extends Record<string, any>,
> extends LogHandler<TContext> {
  private readonly formatter: ConsoleFormatter;

  public readonly threshold: LogLevel | number;

  public constructor(formatter: ConsoleFormatter, threshold: LogLevel | number) {
    super();
    this.formatter = formatter;
    this.threshold = threshold;
  }

  public static create<TContext extends TContextBase, TGlobalContext extends Record<string, any>>(
    pluginManager: PluginManager,
    threshold: LogLevel | number,
  ): ConsoleLogger<TContext, TGlobalContext> {
    return new ConsoleLogger(new ConsoleFormatter(pluginManager, true), threshold);
  }

  public log(entry: LogEntry<TContext, TGlobalContext>): void {
    for (const msg of this.formatter.format(entry)) {
      console.log(msg);
    }
  }

  flush = undefined;
}