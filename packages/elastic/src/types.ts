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
  index: string | ((entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>) => string);
  threshold?: LogLevel;
  bodyMapper?: (
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ) => Record<string, any>;
  errorCallback?: (error: Error) => void;
  errorMsThreshold?: number;
}

export type ElasticOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = ClientOptions & ElasticHandlerOptions<TTaskContext, TGlobalContext>;
