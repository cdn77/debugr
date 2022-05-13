import { LogEntry, TContextBase } from '@debugr/core';

export interface SqlLogEntry<
  TContext extends TContextBase = {
    processId: string;
  },
  TGlobalContext = {},
> extends LogEntry<Partial<TContext>, TGlobalContext> {
  formatId: 'sql';
  data: {
    query: string;
    parameters?: any[];
    error?: string;
    stack?: string;
    time?: number;
  };
}
