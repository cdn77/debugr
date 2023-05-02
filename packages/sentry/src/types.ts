import type {
  LogEntry,
  LogLevel,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import type { MappedRecord } from '@debugr/core';

export interface SentryHandlerOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  dsn?: string;
  thresholds?: Partial<SentryThresholds>;
  extractMessage?: SentryMessageExtractor<TTaskContext, TGlobalContext>;
  levelMap?: MappedRecord<LogLevel, SentryLogLevel>;
}

export type SentryDsn = {
  baseUri: string;
  publicKey: string;
  secretKey?: string;
};

export type SentryThresholds = {
  breadcrumb: LogLevel;
  capture: LogLevel;
};

export type SentryMessageExtractor<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = (
  entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
) => string;

export type SentryLogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

