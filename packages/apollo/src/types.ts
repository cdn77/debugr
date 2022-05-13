import { LogEntry, TContextBase } from '@debugr/core';
import { VariableValues } from 'apollo-server-types';

export type Options = {
  level?: number;
};

export type FullOptions = {
  level: number;
};

export interface GraphQlLogEntry<
  TContext extends TContextBase = {
    processId: string;
  },
  TGlobalContext = {},
> extends LogEntry<Partial<TContext>, TGlobalContext> {
  formatId: 'graphql';
  data: {
    query?: string;
    variables?: VariableValues;
    operation?: string;
  };
}
