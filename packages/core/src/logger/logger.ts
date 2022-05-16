/* eslint-disable guard-for-in */
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

  public constructor(
    logHandlers: LogHandler<Partial<TContext>, TGlobalContext>[],
    globalContext: TGlobalContext,
  ) {
    this.globalContext = globalContext;
    this.logHandlers = logHandlers;
    this.asyncStorage = new AsyncLocalStorage();
  }

  public ensureFork<R>(callback: () => R): R {
    const context = this.asyncStorage.getStore();

    if (context) {
      return callback();
    } else {
      return this.fork(callback);
    }
  }

  public fork<R>(callback: () => R, force?: boolean): R {
    const context = this.asyncStorage.getStore();

    if (context && !force) {
      throw new Error('Logger is already forked');
    }

    // @ts-ignore
    const newContext: Partial<TContext> = { processId: v4() };

    const callbacks: ((callback: () => R) => () => R)[] = this.logHandlers
      .map((logHandler) => logHandler.fork)
      .filter((item) => !!item) as ((callback: () => R) => () => R)[];
    let one: () => R = callback;
    for (const fun of callbacks) {
      one = fun(one);
    }

    return this.asyncStorage.run(newContext, one);
  }

  public trace(data: Record<string, any>): void;
  public trace(message: string, data?: Record<string, any>): void;
  public trace(message: any, data?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, data);
  }

  public debug(data: Record<string, any> | Error): void;
  public debug(message: string, data?: Record<string, any> | Error): void;
  public debug(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(data: Record<string, any> | Error): void;
  public info(message: string, data?: Record<string, any> | Error): void;
  public info(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warning(data: Record<string, any> | Error): void;
  public warning(message: string, data?: Record<string, any> | Error): void;
  public warning(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.WARNING, message, data);
  }

  public error(data: Record<string, any> | Error): void;
  public error(message: string, data?: Record<string, any> | Error): void;
  public error(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.ERROR, message, data);
  }

  public fatal(data: Record<string, any> | Error): void;
  public fatal(message: string, data?: Record<string, any> | Error): void;
  public fatal(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.ERROR, message, data);
  }

  public log(level: LogLevel | number, data: Record<string, any> | Error): void;
  public log(level: LogLevel | number, message: string, data?: Record<string, any> | Error): void;
  public log(
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

  public add(entry: Omit<LogEntry<Partial<TContext>, TGlobalContext>, 'context' | 'ts'>): void {
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

  public setContextProperty<T extends keyof TContext>(
    key: T,
    value: NonNullable<TContext>[T],
  ): void {
    const context = this.asyncStorage.getStore();
    if (context) {
      context[key] = value;
      this.asyncStorage.enterWith(context);
    }
  }

  public flush(): void {
    const context = this.asyncStorage.getStore();

    this.logHandlers.forEach((logHandler) => {
      logHandler.flush && logHandler.flush(context?.processId);
    });
  }

  public registerHandler(logHandler: LogHandler<Partial<TContext>, TGlobalContext>): void {
    this.logHandlers.push(logHandler);
  }

  public hasHandler(id: string): boolean {
    return id in this.logHandlers.map((logHandler) => logHandler.identifier);
  }

  public getHandler(id: string): LogHandler<Partial<TContext>, TGlobalContext> | never {
    const logHandler = this.logHandlers.find((logHandler) => logHandler.identifier === id);

    if (!logHandler) {
      throw new Error(`Unknown plugin: ${id}`);
    }

    return logHandler;
  }

  public getAllHandlers(): LogHandler<Partial<TContext>, TGlobalContext>[] {
    return this.logHandlers;
  }
}
