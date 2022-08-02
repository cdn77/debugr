import { AsyncLocalStorage } from 'async_hooks';
import { sprintf } from 'printj';
import { v4 } from 'uuid';
import { PluginManager } from '../plugins';
import { clone, SmartMap, wrapPossiblePromise } from '../utils';
import { isTaskAwareLogHandler, LogHandler } from './handler';
import { LogEntry, LogLevel, TContextBase, TContextShape } from './types';

export class Logger<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  private readonly globalContext: TGlobalContext;

  private readonly logHandlers: SmartMap<string, LogHandler<TTaskContext, TGlobalContext>>;

  private readonly taskContextStorage: AsyncLocalStorage<Partial<TTaskContext>>;

  public constructor(
    logHandlers: LogHandler<TTaskContext, TGlobalContext>[],
    globalContext: TGlobalContext,
  ) {
    this.globalContext = globalContext;
    this.logHandlers = new SmartMap(logHandlers.map((handler) => [handler.identifier, handler]));
    this.taskContextStorage = new AsyncLocalStorage();
  }

  public runTask<R>(callback: () => R, dontOverrideTask?: boolean): R {
    const context = this.taskContextStorage.getStore();

    if (context && dontOverrideTask) {
      return callback();
    }

    const envelopedCallback = () => {
      return wrapPossiblePromise(callback, {
        catch: (e) => {
          this.error(e);
          throw e;
        },
        finally: () => {
          this.flush();
        },
      });
    };

    const newContext: Partial<TTaskContext> = context ? clone(context) : ({ taskId: v4() } as any);

    const mainCallback = this.logHandlers.reduceRight(
      (child, parent) => (isTaskAwareLogHandler(parent) ? () => parent.runTask(child) : child),
      envelopedCallback,
    );

    return this.taskContextStorage.run(newContext, mainCallback);
  }

  public trace(data: Record<string, any> | Error): this;
  public trace(message: string | [string, ...any], data?: Record<string, any>): this;
  public trace(message: string | [string, ...any], error: Error, data?: Record<string, any>): this;
  public trace(message: any, dataOrError?: any, maybeData?: any): this {
    return this.log(LogLevel.TRACE, message, dataOrError, maybeData);
  }

  public debug(data: Record<string, any> | Error): this;
  public debug(message: string | [string, ...any], data?: Record<string, any>): this;
  public debug(message: string | [string, ...any], error: Error, data?: Record<string, any>): this;
  public debug(message: any, dataOrError?: any, maybeData?: any): this {
    return this.log(LogLevel.DEBUG, message, dataOrError, maybeData);
  }

  public info(data: Record<string, any> | Error): this;
  public info(message: string | [string, ...any], data?: Record<string, any>): this;
  public info(message: string | [string, ...any], error: Error, data?: Record<string, any>): this;
  public info(message: any, dataOrError?: any, maybeData?: any): this {
    return this.log(LogLevel.INFO, message, dataOrError, maybeData);
  }

  public warning(data: Record<string, any> | Error): this;
  public warning(message: string | [string, ...any], data?: Record<string, any>): this;
  public warning(
    message: string | [string, ...any],
    error: Error,
    data?: Record<string, any>,
  ): this;
  public warning(message: any, dataOrError?: any, maybeData?: any): this {
    return this.log(LogLevel.WARNING, message, dataOrError, maybeData);
  }

  public error(data: Record<string, any> | Error): this;
  public error(message: string | [string, ...any], data?: Record<string, any>): this;
  public error(message: string | [string, ...any], error: Error, data?: Record<string, any>): this;
  public error(message: any, dataOrError?: any, maybeData?: any): this {
    return this.log(LogLevel.ERROR, message, dataOrError, maybeData);
  }

  public fatal(data: Record<string, any> | Error): this;
  public fatal(message: string | [string, ...any], data?: Record<string, any>): this;
  public fatal(message: string | [string, ...any], error: Error, data?: Record<string, any>): this;
  public fatal(message: any, dataOrError?: any, maybeData?: any): this {
    return this.log(LogLevel.FATAL, message, dataOrError, maybeData);
  }

  public log(level: LogLevel | number, data: Record<string, any> | Error): this;
  public log(
    level: LogLevel | number,
    message: string | [string, ...any],
    data?: Record<string, any>,
  ): this;
  public log(
    level: LogLevel | number,
    message: string | [string, ...any],
    error: Error,
    data?: Record<string, any>,
  ): this;
  public log(
    level: LogLevel | number,
    messageOrDataOrError: Record<string, any> | Error | string | [string, ...any],
    maybeDataOrError?: Record<string, any> | Error,
    maybeData?: Record<string, any>,
  ): this {
    let error: Error | undefined;
    let data: Record<string, any> | undefined;
    let message: string | undefined;

    if (typeof messageOrDataOrError === 'string' || Array.isArray(messageOrDataOrError)) {
      if (Array.isArray(messageOrDataOrError) && messageOrDataOrError.length > 0) {
        message = sprintf(...messageOrDataOrError);
      } else if (typeof messageOrDataOrError === 'string') {
        message = messageOrDataOrError;
      }

      if (maybeDataOrError instanceof Error) {
        error = maybeDataOrError;
        data = maybeData;
      } else {
        data = maybeDataOrError;
      }
    } else if (messageOrDataOrError instanceof Error) {
      error = messageOrDataOrError;
    } else {
      data = messageOrDataOrError;
    }

    return this.add({
      level,
      message,
      data,
      error,
    });
  }

  public add<TEntry extends LogEntry<any, any> = LogEntry<any, any>>(
    entry: Omit<TEntry, 'taskContext' | 'globalContext' | 'ts'>,
  ): this {
    const ts = new Date();

    this.logHandlers
      .filter((handler) => entry.level >= handler.threshold)
      .forEach((handler) => {
        handler.log({
          ...entry,
          taskContext: this.taskContextStorage.getStore(),
          globalContext: this.globalContext,
          ts,
        });
      });

    return this;
  }

  public setContextProperty<T extends keyof TTaskContext>(
    key: T,
    value: NonNullable<TTaskContext>[T],
  ): this {
    const context = this.taskContextStorage.getStore();

    if (context) {
      context[key] = value;
    }

    return this;
  }

  public flush(): this {
    const context = this.taskContextStorage.getStore();

    this.logHandlers
      .filter(isTaskAwareLogHandler)
      .forEach((handler) => handler.flush(context?.taskId));

    return this;
  }

  public registerHandler(logHandler: LogHandler<TTaskContext, TGlobalContext>): this {
    this.logHandlers.set(logHandler.identifier, logHandler);
    return this;
  }

  public injectPluginManager(pluginManager: PluginManager<TTaskContext, TGlobalContext>): this {
    for (const handler of this.logHandlers.values()) {
      handler.injectPluginManager(pluginManager);
    }

    return this;
  }

  public hasHandler(id: string): boolean {
    return this.logHandlers.has(id);
  }

  public getHandler(id: string): LogHandler<TTaskContext, TGlobalContext> {
    const logHandler = this.logHandlers.get(id);

    if (!logHandler) {
      throw new Error(`Unknown plugin: ${id}`);
    }

    return logHandler;
  }
}
