import { VariableValues } from 'apollo-server-types';
import { OutgoingHttpHeaders } from 'http';

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
  context: Partial<TTaskContext> & TGlobalContext;
  message?: string;
  error?: Error;
  data?: Record<string, any>;
  format?: PluginId;
  ts: ImmutableDate;
};

export interface GraphQlLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends LogEntry<Partial<TTaskContext>, TGlobalContext> {
  format: 'graphql';
  data: {
    query?: string;
    variables?: VariableValues;
    operation?: string;
  };
}

export interface HttpLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends LogEntry<Partial<TTaskContext>, TGlobalContext> {
  format: 'http';
  data: {
    type: string;
    status?: number;
    message?: string;
    headers: OutgoingHttpHeaders;
    body?: string;
    bodyLength?: number;
    lengthMismatch?: boolean;
    method?: string;
    uri?: string;
    ip?: string;
  };
}

export interface SqlLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends LogEntry<Partial<TTaskContext>, TGlobalContext> {
  format: 'sql';
  data: {
    query: string;
    parameters?: any[];
    error?: string;
    stack?: string;
    time?: number;
  };
}
