/* eslint-disable guard-for-in */
import { v4 } from 'node-uuid';
import v8 from 'v8';
import { vsprintf } from 'printj';

import { AsyncLocalStorage } from 'async_hooks';
import { LogLevel, TContextBase, LogEntry, TContextShape } from './types';
import { isTaskAwareLogHandler, LogHandler, TaskAwareLogHandler } from './handler';

export class Logger<
  TTaskContext extends TContextBase = TContextBase,
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

  public runTask<R>(callback: () => R, dontOverrideTask?: boolean): R {
    const context = this.taskContextStorage.getStore();

    if (context && dontOverrideTask) {
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

    const newContext: Partial<TTaskContext> = context
      ? v8.deserialize(v8.serialize(context))
      : { processId: v4() };

    const mainCallback = this.logHandlers.reduceRight(
      (child, parent) => (isTaskAwareLogHandler(parent) ? () => parent.runTask(child) : child),
      envelopedCallback,
    );

    return this.taskContextStorage.run(newContext, mainCallback);
  }

  public trace(data: Record<string, any> | Error): Logger<TTaskContext, TGlobalContext>;
  public trace(
    message: string | string[],
    data?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public trace(
    message: string | string[],
    error: Error,
    additionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public trace(
    message: any,
    dataOrError?: Record<string, any> | Error,
    maybeAdditionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext> {
    if (dataOrError instanceof Error) {
      this.log(LogLevel.TRACE, message, dataOrError, maybeAdditionalData);
    } else {
      this.log(LogLevel.TRACE, message, dataOrError);
    }
    return this;
  }

  public debug(data: Record<string, any> | Error): Logger<TTaskContext, TGlobalContext>;
  public debug(
    message: string | string[],
    data?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public debug(
    message: string | string[],
    error: Error,
    additionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public debug(
    message: any,
    dataOrError?: Record<string, any> | Error,
    maybeAdditionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext> {
    if (dataOrError instanceof Error) {
      this.log(LogLevel.DEBUG, message, dataOrError, maybeAdditionalData);
    } else {
      this.log(LogLevel.DEBUG, message, dataOrError);
    }
    return this;
  }

  public info(data: Record<string, any> | Error): Logger<TTaskContext, TGlobalContext>;
  public info(
    message: string | string[],
    data?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public info(
    message: string | string[],
    error: Error,
    additionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public info(
    message: any,
    dataOrError?: Record<string, any> | Error,
    maybeAdditionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext> {
    if (dataOrError instanceof Error) {
      this.log(LogLevel.INFO, message, dataOrError, maybeAdditionalData);
    } else {
      this.log(LogLevel.INFO, message, dataOrError);
    }
    return this;
  }

  public warning(data: Record<string, any> | Error): Logger<TTaskContext, TGlobalContext>;
  public warning(
    message: string | string[],
    data?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public warning(
    message: string | string[],
    error: Error,
    additionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public warning(
    message: any,
    dataOrError?: Record<string, any> | Error,
    maybeAdditionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext> {
    if (dataOrError instanceof Error) {
      this.log(LogLevel.WARNING, message, dataOrError, maybeAdditionalData);
    } else {
      this.log(LogLevel.WARNING, message, dataOrError);
    }
    return this;
  }

  public error(data: Record<string, any> | Error): Logger<TTaskContext, TGlobalContext>;
  public error(
    message: string | string[],
    data?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public error(
    message: string | string[],
    error: Error,
    additionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public error(
    message: any,
    dataOrError?: Record<string, any> | Error,
    maybeAdditionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext> {
    if (dataOrError instanceof Error) {
      this.log(LogLevel.ERROR, message, dataOrError, maybeAdditionalData);
    } else {
      this.log(LogLevel.ERROR, message, dataOrError);
    }
    return this;
  }

  public fatal(data: Record<string, any> | Error): Logger<TTaskContext, TGlobalContext>;
  public fatal(
    message: string | string[],
    data?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public fatal(
    message: string | string[],
    error: Error,
    additionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public fatal(
    message: any,
    dataOrError?: Record<string, any> | Error,
    maybeAdditionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext> {
    if (dataOrError instanceof Error) {
      this.log(LogLevel.FATAL, message, dataOrError, maybeAdditionalData);
    } else {
      this.log(LogLevel.FATAL, message, dataOrError);
    }
    return this;
  }

  public log(
    level: LogLevel | number,
    data: Record<string, any> | Error,
  ): Logger<TTaskContext, TGlobalContext>;
  public log(
    level: LogLevel | number,
    message: string | string[],
    data?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public log(
    level: LogLevel | number,
    message: string | string[],
    error: Error,
    additionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext>;
  public log(
    level: LogLevel | number,
    messageOrDataOrError: Record<string, any> | Error | string | string[],
    maybeDataOrError?: Record<string, any> | Error,
    maybeAdditionalData?: Record<string, any>,
  ): Logger<TTaskContext, TGlobalContext> {
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
        data = maybeAdditionalData;
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

    return this;
  }

  public add(
    entry: Omit<LogEntry<Partial<TTaskContext>, TGlobalContext>, 'context' | 'ts'>,
  ): Logger<TTaskContext, TGlobalContext> {
    const context: Partial<TTaskContext> = this.taskContextStorage.getStore() || {};

    this.logHandlers
      .filter((item) => entry.level >= item.threshold)
      .forEach((logHandler) => {
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

    return this;
  }

  public setContextProperty<T extends keyof TTaskContext>(
    key: T,
    value: NonNullable<TTaskContext>[T],
  ): Logger<TTaskContext, TGlobalContext> {
    const context = this.taskContextStorage.getStore();
    if (context) {
      context[key] = value;
    }
    return this;
  }

  public flush(): Logger<TTaskContext, TGlobalContext> {
    const context = this.taskContextStorage.getStore();

    this.logHandlers.forEach((logHandler) => {
      (logHandler as TaskAwareLogHandler<TTaskContext, TGlobalContext>).flush &&
        (logHandler as TaskAwareLogHandler<TTaskContext, TGlobalContext>).flush(context?.processId);
    });

    return this;
  }

  public registerHandler(
    logHandler: LogHandler<Partial<TTaskContext>, TGlobalContext>,
  ): Logger<TTaskContext, TGlobalContext> {
    this.logHandlers.push(logHandler);
    return this;
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
