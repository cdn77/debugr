import type { LogEntry, TContextBase, TContextShape } from '@debugr/core';

declare module '@debugr/core' {
  export interface EntryTypes {
    'sql.query': SqlQueryData;
  }
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

export interface SqlQueryLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  type: 'sql.query';
  data: SqlQueryData;
}

export type SqlQueryFormatter = (query: string) => string;
