import { LogEntry, TContextBase, TContextShape } from '@debugr/core';

export interface GraphQLQueryData {
  query: string;
  variables?: Record<string, any>;
  operation?: string;
}

export interface GraphQlLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  format: 'graphql';
  data: GraphQLQueryData;
}
