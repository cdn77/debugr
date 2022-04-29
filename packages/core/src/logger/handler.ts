import { LogEntry, LogLevel, TContextBase } from './types';

export abstract class LogHandler<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  public readonly threshold: LogLevel | number;

  public abstract log(entry: LogEntry<TContext, TGlobalContext>): void;

  public abstract flush?(): void;
}
