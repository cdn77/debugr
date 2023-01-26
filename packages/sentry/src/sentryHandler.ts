import type {
  HandlerPlugin,
  LogEntry,
  Logger,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel, PluginKind } from '@debugr/core';
import * as Sentry from '@sentry/node';
import type { SentryHandlerOptions, SentryOptions } from './types';

export class SentryHandler<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>
  implements HandlerPlugin<TTaskContext, TGlobalContext>
{
  public readonly id = 'sentry';
  public readonly kind = PluginKind.Handler;

  private readonly options: SentryHandlerOptions<TTaskContext, TGlobalContext>;
  private readonly threshold: LogLevel;
  private readonly localErrors: WeakSet<Error>;
  private logger?: Logger;

  public constructor({ thresholds, extractMessage, ...options}: SentryOptions) {
    Sentry.init(options);
    this.options = {
      thresholds,
      extractMessage,
    };
    this.threshold = thresholds?.breadcrumb ?? LogLevel.ALL;
    this.localErrors = new WeakSet();
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    try {
      if (
        (entry.level >= LogLevel.ALL && entry.level < this.threshold) ||
        (entry.error && this.localErrors.has(entry.error))
      ) {
        return;
      }


      if (entry.level >= (this.options.thresholds?.capture ?? LogLevel.ERROR)) {
        Sentry.captureMessage(this.options.extractMessage ? this.options.extractMessage(entry) : this.defaultExtractMessage(entry), {
          extra: {
            ...entry.taskContext,
            ...entry.globalContext,
          },
        });
      } else {
        Sentry.addBreadcrumb({
          data: entry.data,
          message: this.options.extractMessage ? this.options.extractMessage(entry) : this.defaultExtractMessage(entry),
          timestamp: entry.ts.getTime(),
        });
      }

      if (entry.error) {
        Sentry.captureException(entry.error, {
          extra: {
            ...entry.taskContext,
            ...entry.globalContext,
          },
        });
      }

    } catch (error) {
      this.localErrors.add(error);
      this.logger?.log(LogLevel.INTERNAL, error);
    }
  }

  private defaultExtractMessage(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): string {
    if (entry.error) {
      return entry.error.message;
    }

    if (entry.message) {
      return entry.message;
    }

    return 'Empty Message';
  }
}
