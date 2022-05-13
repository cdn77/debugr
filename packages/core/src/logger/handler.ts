import { LogEntry, LogLevel, TContextBase } from './types';

export abstract class LogHandler<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  public readonly threshold: LogLevel | number;

  public readonly identifier: string;

  public readonly doesNeedFormatters: boolean;

  public abstract log(entry: LogEntry<Partial<TContext>, TGlobalContext>): void;

  public abstract flush?(processId: string, forceWrite?: boolean): void;
}
