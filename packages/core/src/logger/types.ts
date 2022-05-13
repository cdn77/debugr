import { PluginId } from '../plugins';

export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARNING = 40,
  ERROR = 50,
  FATAL = 60,
}

export type TContextBase = {
  processId?: string;
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

export type LogEntry<TContext extends TContextBase = { processId: string }, TGlobalContext = {}> = {
  level: LogLevel | number;
  context: Partial<TContext> & TGlobalContext;
  message?: string;
  error?: Error;
  data?: Record<string, any>;
  formatId?: PluginId;
  ts: ImmutableDate;
};
