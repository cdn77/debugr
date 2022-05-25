/* eslint-disable guard-for-in */
import { v4 } from 'node-uuid';
import v8 from 'v8';
import { vsprintf } from 'printj';

import { AsyncLocalStorage } from 'async_hooks';
import { LogLevel, TContextBase, LogEntry, TContextShape } from './types';
import { isTaskAwareLogHandler, LogHandler, TaskAwareLogHandler } from './handler';

export class Logger<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> {
  private readonly globalContext: TGlobalContext;

  private readonly logHandlers: LogHandler<Partial<TTaskContext>, TGlobalContext>[];

  private readonly taskContextStorage: AsyncLocalStorage<Partial<TTaskContext>>;

  public constructor(
    logHandlers: LogHandler<Partial<TTaskContext>, TGlobalContext>[],
    globalContext: TGlobalContext,
  ) {
    this.globalContext = globalContext;
    this.logHandlers = logHandlers;
    this.taskContextStorage = new AsyncLocalStorage();
  }

  public runTask<R>(callback: () => R, force?: boolean): R {
    const context = this.taskContextStorage.getStore();

    if (context && !force) {
      return callback();
    }

    const envelopedCallback = () => {
      let response: R | Promise<R>;
      try {
        response = callback();
      } catch (e) {
        this.error(e);
        this.flush();
        throw e;
      }
      if (
        typeof response === 'object' &&
        typeof (response as unknown as Promise<R>).then === 'function'
      ) {
        (response as unknown as Promise<R>)
          .catch((e) => {
            this.error(e);
            throw e;
          })
          .finally(() => {
            this.flush();
          });
      } else {
        this.flush();
      }
      return response;
    };

    // @ts-ignore
    const newContext: Partial<TTaskContext> = { processId: v4() };

    const mainCallback = this.logHandlers.reduceRight(
      (child, parent) => (isTaskAwareLogHandler(parent) ? () => parent.runTask(child) : child),
      envelopedCallback,
    );

    return this.taskContextStorage.run(newContext, mainCallback);
  }

  public trace(data: Record<string, any>): void;
  public trace(message: string | string[], data?: Record<string, any>): void;
  public trace(message: any, data?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, data);
  }

  public debug(data: Record<string, any> | Error): void;
  public debug(message: string | string[], data?: Record<string, any> | Error): void;
  public debug(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(data: Record<string, any> | Error): void;
  public info(message: string | string[], data?: Record<string, any> | Error): void;
  public info(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warning(data: Record<string, any> | Error): void;
  public warning(message: string | string[], data?: Record<string, any> | Error): void;
  public warning(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.WARNING, message, data);
  }

  public error(data: Record<string, any> | Error): void;
  public error(message: string | string[], data?: Record<string, any> | Error): void;
  public error(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.ERROR, message, data);
  }

  public fatal(data: Record<string, any> | Error): void;
  public fatal(message: string | string[], data?: Record<string, any> | Error): void;
  public fatal(message: any, data?: Record<string, any> | Error): void {
    this.log(LogLevel.FATAL, message, data);
  }

  public log(level: LogLevel | number, data: Record<string, any> | Error): void;
  public log(
    level: LogLevel | number,
    message: string | string[],
    data?: Record<string, any> | Error,
  ): void;
  public log(
    level: LogLevel | number,
    messageOrDataOrError: Record<string, any> | Error | string | string[],
    maybeDataOrError?: Record<string, any> | Error,
  ): void {
    let error: Error | undefined;
    let data: Record<string, any> | undefined;
    let message: string | undefined;
    if (typeof messageOrDataOrError === 'string' || Array.isArray(messageOrDataOrError)) {
      if (Array.isArray(messageOrDataOrError) && messageOrDataOrError.length > 0) {
        message = vsprintf(messageOrDataOrError.shift()!, messageOrDataOrError);
      } else if (typeof messageOrDataOrError === 'string') {
        message = messageOrDataOrError;
      }

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

  public add(entry: Omit<LogEntry<Partial<TTaskContext>, TGlobalContext>, 'context' | 'ts'>): void {
    const context: Partial<TTaskContext> = this.taskContextStorage.getStore() || {};

    this.logHandlers.forEach((logHandler) => {
      logHandler.log({
        level: entry.level,
        context: v8.deserialize(v8.serialize({ ...context, ...this.globalContext })),
        message: entry.message,
        data: entry.data,
        format: entry.format,
        error: entry.error,
        ts: new Date(),
      });
    });
  }

  public setContextProperty<T extends keyof TTaskContext>(
    key: T,
    value: NonNullable<TTaskContext>[T],
  ): void {
    const context = this.taskContextStorage.getStore();
    if (context) {
      context[key] = value;
    }
  }

  public flush(): void {
    const context = this.taskContextStorage.getStore();

    this.logHandlers.forEach((logHandler) => {
      (logHandler as TaskAwareLogHandler<TTaskContext, TGlobalContext>).flush &&
        (logHandler as TaskAwareLogHandler<TTaskContext, TGlobalContext>).flush(context?.processId);
    });
  }

  public registerHandler(logHandler: LogHandler<Partial<TTaskContext>, TGlobalContext>): void {
    this.logHandlers.push(logHandler);
  }

  public hasHandler(id: string): boolean {
    return id in this.logHandlers.map((logHandler) => logHandler.identifier);
  }

  public getHandler(id: string): LogHandler<Partial<TTaskContext>, TGlobalContext> | never {
    const logHandler = this.logHandlers.find((logHandler) => logHandler.identifier === id);

    if (!logHandler) {
      throw new Error(`Unknown plugin: ${id}`);
    }

    return logHandler;
  }

  public getAllHandlers(): LogHandler<Partial<TTaskContext>, TGlobalContext>[] {
    return this.logHandlers;
  }
}
