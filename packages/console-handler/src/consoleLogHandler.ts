import { LogEntry, LogLevel, TContextBase, LogHandler, PluginManager } from '@debugr/core';

import { ConsoleFormatter } from './consoleFormatter';

export class ConsoleLogHandler<
  TContext extends TContextBase,
  TGlobalContext extends Record<string, any>,
> extends LogHandler<TContext> {
  private readonly formatter: ConsoleFormatter<Partial<TContext>, TGlobalContext>;

  public readonly threshold: LogLevel | number;

  public constructor(
    formatter: ConsoleFormatter<Partial<TContext>, TGlobalContext>,
    threshold: LogLevel | number,
  ) {
    super();
    this.formatter = formatter;
    this.threshold = threshold;
  }

  public static create<TContext extends TContextBase, TGlobalContext extends Record<string, any>>(
    pluginManager: PluginManager,
    threshold: LogLevel | number,
  ): ConsoleLogHandler<Partial<TContext>, TGlobalContext> {
    return new ConsoleLogHandler<Partial<TContext>, TGlobalContext>(
      new ConsoleFormatter<Partial<TContext>, TGlobalContext>(pluginManager, true),
      threshold,
    );
  }

  public log(entry: LogEntry<Partial<TContext>, TGlobalContext>): void {
    for (const msg of this.formatter.format(entry)) {
      console.log(msg);
    }
  }

  flush = undefined;

  fork = undefined;
}
