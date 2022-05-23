import { PluginManager } from '../plugins';
import { LogEntry, LogLevel, TContextBase, TContextShape } from './types';

export abstract class LogHandler<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> {
  public readonly threshold: LogLevel | number;

  public readonly identifier: string;

  public readonly doesNeedFormatters: boolean;

  public abstract log(entry: LogEntry<Partial<TTaskContext>, TGlobalContext>): void;

  public abstract injectPluginManager(pluginManager: PluginManager): void;
}

export abstract class TaskAwareLogHandler<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> extends LogHandler<TTaskContext, TGlobalContext> {
  public abstract flush(processId?: string, forceWrite?: boolean): void;

  public abstract runTask<R>(callback: () => R): () => R;
}
