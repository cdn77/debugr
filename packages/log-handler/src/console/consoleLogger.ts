import { LogLevel, TContextBase, LogHandler } from '@debugr/core';
import { LogEntry } from '@debugr/core/src';

import { ConsoleFormatter } from './consoleFormatter';

export class ConsoleLogger<
  TContext extends TContextBase,
  TGlobalContext extends Record<string, any>,
> extends LogHandler<TContext> {
  private readonly formatter: ConsoleFormatter;

  public readonly threshold: LogLevel | number;

  constructor(formatter: ConsoleFormatter, threshold: LogLevel | number) {
    super();
    this.formatter = formatter;
    this.threshold = threshold;
  }

  log(entry: LogEntry<TContext, TGlobalContext>): void {
    for (const msg of this.formatter.format(entry)) {
      console.log(msg);
    }
  }

  flush = undefined;
}
