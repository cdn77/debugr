import type { LogEntry, TContextBase, TContextShape } from '@debugr/core';

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
