import { LogEntry, TContextBase, TContextShape } from '@debugr/core';

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
