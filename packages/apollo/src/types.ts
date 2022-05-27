import { LogEntry, TContextBase, TContextShape } from '@debugr/core';
import { VariableValues } from 'apollo-server-types';

export type Options = {
  level?: number;
};

export type FullOptions = {
  level: number;
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
