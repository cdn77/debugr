import type {
  LogEntry,
  LogLevel,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import type { ClientOptions } from '@elastic/elasticsearch';

export interface ElasticHandlerOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
  > {
  threshold: LogLevel | number;
  index: string | ((entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>) => string);
  errorCallback?: (error: Error) => void;
  bodyMapper?: (
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ) => Record<string, any>;
  errorMsThreshold?: number;
}

export type ElasticOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
  > = ClientOptions & ElasticHandlerOptions<TTaskContext, TGlobalContext>;
