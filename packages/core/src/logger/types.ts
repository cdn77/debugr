import { PluginId } from '../plugins';

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

export interface TContextFixed {
  taskId?: string;
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
  format?: PluginId;
  ts: ImmutableDate;
};
