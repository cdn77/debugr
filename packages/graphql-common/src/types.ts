import type { LogEntry, TContextBase, TContextShape } from '@debugr/core';

export interface GraphQLQueryData {
  query: string;
  variables?: Record<string, any>;
  operation?: string;
}

export interface GraphQLQueryLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  type: 'graphql.query';
  data: GraphQLQueryData;
}
