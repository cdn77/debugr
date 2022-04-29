import { PluginId } from '../plugins';

export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARNING = 40,
  ERROR = 50,
  FATAL = 60,
}

export type TContextBase = TContextFullOptional<
  Record<string, boolean | string | number | Date | undefined>
> & {
  processId: string;
};

export type TContextFullOptional<BaseType extends Record<string, any>> = {
  [K in keyof BaseType]?: BaseType[K];
};

export type LogEntry<TContext = { processId: string }, TGlobalContext = {}> = {
  level: LogLevel | number;
  context: TContext & TGlobalContext;
  message?: string;
  error?: Error;
  data?: Record<string, any>;
  pluginId?: PluginId;
  ts: Date;
};
