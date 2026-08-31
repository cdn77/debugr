import type { LogEntry, TContextBase, TContextShape } from '@debugr/core';

declare module '@debugr/core' {
  export interface EntryTypes {
    'graphql.query': GraphqlQueryData;
  }
}

export interface GraphqlQueryData {
  query: string;
  variables?: Record<string, any>;
  operation?: string;
}

export interface GraphqlQueryLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  type: 'graphql.query';
  data: GraphqlQueryData;
}
