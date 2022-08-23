import { PluginManager } from '../plugins';
import { LogEntry, LogLevel, ReadonlyRecursive, TContextBase, TContextShape } from './types';

export abstract class LogHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  public readonly threshold: LogLevel | number;

  public readonly identifier: string;

  public readonly doesNeedFormatters: boolean;

  public abstract log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): void | Promise<void>;

  public abstract injectPluginManager(
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
  ): void;
}

export abstract class TaskAwareLogHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogHandler<TTaskContext, TGlobalContext> {
  public abstract flush(taskId?: string): void;

  public abstract runTask<R>(callback: () => R, taskId?: string): R;
}

export function isTaskAwareLogHandler<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
>(
  handler: LogHandler<TTaskContext, TGlobalContext>,
): handler is TaskAwareLogHandler<TTaskContext, TGlobalContext> {
  return typeof (handler as any).runTask === 'function';
}
