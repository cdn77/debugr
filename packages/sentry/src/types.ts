import type {
  LogEntry,
  LogLevel,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import type * as Sentry from '@sentry/node';

export interface SentryHandlerOptions<
TTaskContext extends TContextBase = TContextBase,
TGlobalContext extends TContextShape = TContextShape,
> {
  thresholds?: {
    breadcrumb?: LogLevel;
    capture?: LogLevel;
  };
  extractMessage?: (
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ) => string
}

export type SentryOptions<
TTaskContext extends TContextBase = TContextBase,
TGlobalContext extends TContextShape = TContextShape,
> = Sentry.NodeOptions & SentryHandlerOptions<TTaskContext, TGlobalContext>;
