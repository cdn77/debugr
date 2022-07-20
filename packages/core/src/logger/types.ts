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
  TGlobalContext extends TContextShape = {},
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

export interface GraphQLQueryData {
  query: string;
  variables?: Record<string, any>;
  operation?: string;
}

export interface GraphQlLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends LogEntry<TTaskContext, TGlobalContext> {
  format: 'graphql';
  data: GraphQLQueryData;
}

export interface HttpHeaders {
  [header: string]: number | string | string[] | undefined;
}

export interface HttpRequestData {
  type: 'request';
  method: string;
  uri: string;
  headers?: HttpHeaders;
  ip?: string;
  body?: string;
  bodyLength?: number;
  lengthMismatch?: boolean;
}

export interface HttpResponseData {
  type: 'response';
  status: number;
  message?: string;
  headers?: HttpHeaders;
  body?: string;
  bodyLength?: number;
  lengthMismatch?: boolean;
}

export interface HttpLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends LogEntry<TTaskContext, TGlobalContext> {
  format: 'http';
  data: HttpRequestData | HttpResponseData;
}

export interface SqlQueryData {
  query: string;
  parameters?: any[];
  error?: string;
  stack?: string;
  affectedRows?: number;
  rows?: number;
  time?: number;
}

export interface SqlLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends LogEntry<TTaskContext, TGlobalContext> {
  format: 'sql';
  data: SqlQueryData;
}
