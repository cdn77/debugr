import type {
  LogEntry,
  Logger,
  ReadonlyRecursive,
  TaskAwareHandlerPlugin,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel, PluginKind } from '@debugr/core';
import * as Sentry from '@sentry/node';
import type { SentryOptions } from './types';

export class SentryHandler<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>
  implements TaskAwareHandlerPlugin<TTaskContext, TGlobalContext>
{
  public readonly id = 'sentry';
  public readonly kind = PluginKind.Handler;

  private readonly options: SentryOptions;
  private readonly threshold: LogLevel;
  private readonly localErrors: WeakSet<Error>;
  private logger?: Logger;

  public constructor(options: SentryOptions) {
    Sentry.init(options);
    this.options = options;
    this.threshold = options.thresholds?.breadcrumb ?? LogLevel.ALL;
    this.localErrors = new WeakSet();
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public runTask<R>(callback: () => R): R {
    // const stack: string[] = [...(this.asyncStorage.getStore() || []), v4()];
    // return this.asyncStorage.run(stack, callback);
    return callback();
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

      Sentry.setExtra('globalContext', entry.globalContext);
      if (entry.taskContext) {
        Sentry.setExtra('taskContext', entry.taskContext);
      }

      if (entry.level >= (this.options.thresholds?.capture ?? LogLevel.ERROR)) {
        Sentry.captureMessage(entry.message ?? 'empty message');
      } else {
        Sentry.addBreadcrumb({
          data: entry.data,
          message: entry.message,
          timestamp: entry.ts.getTime(),
        });
      }
    } catch (error) {
      this.localErrors.add(error);
      this.logger?.log(LogLevel.INTERNAL, error);
    }
  }
}
