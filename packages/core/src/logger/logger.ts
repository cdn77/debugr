import { v4 } from 'node-uuid';

import { AsyncLocalStorage } from 'async_hooks';
import { LogLevel, TContextBase, LogEntry } from './types';
import { LogHandler } from './handler';

export class Logger<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  private readonly globalContext: TGlobalContext;

  private readonly logHandlers: LogHandler<Partial<TContext>, TGlobalContext>[];

  private readonly asyncStorage: AsyncLocalStorage<Partial<TContext>>;

  constructor(
    logHandlers: LogHandler<Partial<TContext>, TGlobalContext>[],
    globalContext: TGlobalContext,
  ) {
    this.globalContext = globalContext;
    this.logHandlers = logHandlers;
    this.asyncStorage = new AsyncLocalStorage();
  }

  ensureFork<R>(callback: () => R): R {
    const tag = this.asyncStorage.getStore();

    if (tag) {
      return callback();
    } else {
      return this.fork(callback);
    }
  }

  fork<R>(callback: () => R): R;
  fork<R>(force: true, callback: () => R): R;
  fork<R>(callbackOrForce: boolean | (() => R), maybeCallback?: () => R): R {
    const [callback, force] =
      typeof callbackOrForce === 'boolean'
        ? [maybeCallback!, callbackOrForce]
        : [callbackOrForce, false];

    const context = this.asyncStorage.getStore();

    if (context && !force) {
      throw new Error('Logger is already forked');
    }

    // @ts-ignore
    const newContext: Partial<TContext> = { processId: v4() };

    return this.asyncStorage.run(newContext, callback);
  }

  trace(data: Record<string, any>): void;
  trace(message: string, data?: Record<string, any>): void;
  trace(message: any, data?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, data);
  }

  debug(data: Record<string, any> | Error): void;
  debug(message: string, data?: Record<string, any> | Error): void;
  debug(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(data: Record<string, any> | Error): void;
  info(message: string, data?: Record<string, any> | Error): void;
  info(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.INFO, message, data);
  }

  warning(data: Record<string, any> | Error): void;
  warning(message: string, data?: Record<string, any> | Error): void;
  warning(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.WARNING, message, data);
  }

  error(data: Record<string, any> | Error): void;
  error(message: string, data?: Record<string, any> | Error): void;
  error(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.ERROR, message, data);
  }

  fatal(data: Record<string, any> | Error): void;
  fatal(message: string, data?: Record<string, any> | Error): void;
  fatal(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.ERROR, message, data);
  }

  log(level: LogLevel | number, data: Record<string, any> | Error): void;
  log(level: LogLevel | number, message: string, data?: Record<string, any> | Error): void;
  log(
    level: LogLevel | number,
    messageOrDataOrError: Record<string, any> | Error | string,
    maybeDataOrError?: Record<string, any> | Error,
  ): void {
    let error: Error | undefined;
    let data: Record<string, any> | undefined;
    let message: string | undefined;
    if (typeof messageOrDataOrError === 'string') {
      message = messageOrDataOrError;
      if (maybeDataOrError instanceof Error) {
        error = maybeDataOrError;
      } else {
        data = maybeDataOrError;
      }
    } else if (messageOrDataOrError instanceof Error) {
      error = messageOrDataOrError;
    } else {
      data = messageOrDataOrError;
    }

    this.add({
      level,
      message,
      data,
      error,
    });
  }

  add(entry: Omit<LogEntry<Partial<TContext>, TGlobalContext>, 'context' | 'ts'>): void {
    const context: Partial<TContext> = this.asyncStorage.getStore() || {};

    this.logHandlers.forEach((logHandler) => {
      logHandler.log({
        level: entry.level,
        context: JSON.parse(JSON.stringify({ ...context, ...this.globalContext })),
        message: entry.message,
        data: entry.data,
        formatId: entry.formatId,
        error: entry.error,
        ts: new Date(),
      });
    });
  }

  setContextProperty<T extends keyof TContext>(key: T, value: NonNullable<TContext>[T]): void {
    const context = this.asyncStorage.getStore();
    if (context) {
      context[key] = value;
      this.asyncStorage.enterWith(context);
    }
  }

  flush(): void {
    const context = this.asyncStorage.getStore();

    this.logHandlers.forEach((logHandler) => {
      logHandler.flush && logHandler.flush(context?.processId || v4());
    });
  }
}
