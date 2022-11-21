import type { LogEntry, TContextBase, TContextShape } from '@debugr/core';
import type { EntryType } from '@debugr/core';

declare module '@debugr/core' {
  export const enum EntryType {
    GraphqlQuery = 'graphql.query',
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
  type: EntryType.GraphqlQuery;
  data: GraphqlQueryData;
}
