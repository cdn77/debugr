import type {
  LogEntry,
  LogLevel,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import type { ClientOptions } from '@elastic/elasticsearch';

export type EntryTransformer<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = (
  entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  taskStack?: string[],
) => Record<string, any> | undefined;

export interface ElasticHandlerOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  index: string | ((entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>) => string);
  threshold?: LogLevel;
  transformer?: EntryTransformer<TTaskContext, TGlobalContext>;
  errorCallback?: (error: Error) => void;
  errorMsThreshold?: number;
}

export type ElasticOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = ClientOptions & ElasticHandlerOptions<TTaskContext, TGlobalContext>;
