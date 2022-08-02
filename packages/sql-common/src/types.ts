import { LogEntry, TContextBase, TContextShape } from '@debugr/core';

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
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  format: 'sql';
  data: SqlQueryData;
}
