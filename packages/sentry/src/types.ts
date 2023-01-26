import type {
  LogLevel,
} from '@debugr/core';
import type * as Sentry from '@sentry/node';

export interface SentryHandlerOptions {
  thresholds?: {
    breadcrumb?: LogLevel;
    capture?: LogLevel;
  };
}

export type SentryOptions = Sentry.NodeOptions & SentryHandlerOptions;
