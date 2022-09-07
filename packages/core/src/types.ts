import type { Logger } from './logger';
import type { PluginManager } from './pluginManager';

export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARNING = 40,
  ERROR = 50,
  FATAL = 60,
}

export type TContextShape = {
  [property: string]: TContextShape | Date | string | number | boolean | undefined | null;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TContextFixed {
  //
}

export type TContextBase = TContextShape & TContextFixed;

export type ReadonlyRecursive<T> = {
  readonly [P in keyof T]: Readonly<T[P]>;
};

export type ImmutableDate = Omit<
  Date,
  | 'setTime'
  | 'setMilliseconds'
  | 'setUTCMilliseconds'
  | 'setSeconds'
  | 'setUTCSeconds'
  | 'setMinutes'
  | 'setUTCMinutes'
  | 'setHours'
  | 'setUTCHours'
  | 'setDate'
  | 'setUTCDate'
  | 'setMonth'
  | 'setUTCMonth'
  | 'setFullYear'
  | 'setUTCFullYear'
  >;

export type LogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
  > = {
  level: LogLevel | number;
  taskContext?: Partial<TTaskContext>;
  globalContext: TGlobalContext;
  message?: string;
  error?: Error;
  data?: Record<string, any>;
  type?: string;
  ts: ImmutableDate;
};

export interface Plugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  readonly id: string;
  injectLogger?(
    logger: Logger<TTaskContext, TGlobalContext>,
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
  ): void;
}

export interface CollectorPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends Plugin<TTaskContext, TGlobalContext> {
  readonly entryTypes: string[];
}

export function isCollectorPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is CollectorPlugin<TTaskContext, TGlobalContext> {
  return Array.isArray((plugin as any).entryTypes);
}

export interface FormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends Plugin<TTaskContext, TGlobalContext> {
  readonly entryType: string;
  readonly targetHandler: string;
}

export function isFormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is FormatterPlugin<TTaskContext, TGlobalContext> {
  return typeof (plugin as any).targetHandler === 'string';
}

export type FormatterPluginTypeGuard<TFormatter extends FormatterPlugin<any, any>> = {
  (plugin: FormatterPlugin): plugin is TFormatter;
};

export interface LogHandlerPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends Plugin<TTaskContext, TGlobalContext> {
  log(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): Promise<void> | void;
}

export function isLogHandlerPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is LogHandlerPlugin<TTaskContext, TGlobalContext> {
  return typeof (plugin as any).log === 'function';
}

export interface TaskAwareLogHandlerPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogHandlerPlugin<TTaskContext, TGlobalContext> {
  runTask<R>(callback: () => R): R;
}

export function isTaskAwareLogHandlerPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is TaskAwareLogHandlerPlugin<TTaskContext, TGlobalContext> {
  return isLogHandlerPlugin(plugin) && typeof (plugin as any).runTask === 'function';
}

export interface Plugins<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  [id: string]: Plugin<TTaskContext, TGlobalContext>;
}

export type PluginId = Exclude<keyof Plugins, number | symbol>;