import {
  LogEntry,
  LogLevel,
  TContextBase,
  LogHandler,
  PluginManager,
  TContextShape,
  ReadonlyRecursive,
} from '@debugr/core';

import { ConsoleFormatter } from './consoleFormatter';

export class ConsoleLogHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends LogHandler<Partial<TTaskContext>, TGlobalContext> {
  private formatter?: ConsoleFormatter<Partial<TTaskContext>, TGlobalContext>;

  private readonly writeTimestamp: boolean;

  public readonly threshold: LogLevel | number;

  public constructor(
    threshold: LogLevel | number,
    writeTimestamp: boolean = true,
    formatter?: ConsoleFormatter<Partial<TTaskContext>, TGlobalContext>,
  ) {
    super();
    this.formatter = formatter;
    this.writeTimestamp = writeTimestamp;
    this.threshold = threshold;
  }

  public injectPluginManager(pluginManager: PluginManager<TContextShape, {}>): void {
    if (!this.formatter) {
      this.formatter = new ConsoleFormatter<Partial<TTaskContext>, TGlobalContext>(
        pluginManager,
        this.writeTimestamp,
      );
    }
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    threshold: LogLevel | number,
    writeTimestamp: boolean = true,
  ): ConsoleLogHandler<Partial<TTaskContext>, TGlobalContext> {
    return new ConsoleLogHandler<Partial<TTaskContext>, TGlobalContext>(threshold, writeTimestamp);
  }

  public log(entry: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>>): void {
    if (!this.formatter) {
      throw new Error('Logger was incorrectly initialized, no formatter found');
    }

    for (const msg of this.formatter.format(entry)) {
      console.log(msg);
    }
  }
}
