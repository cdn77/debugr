import { AsyncLocalStorage } from 'async_hooks';
import { sprintf } from 'printj';
import { PluginManager } from './pluginManager';
import type { LogEntry, LogHandlerPlugin, Plugin, TContextBase, TContextShape } from './types';
import type { PluginId, Plugins } from './types';
import { isLogHandlerPlugin, isTaskAwareLogHandlerPlugin } from './types';
import { LogLevel } from './types';
import { clone, SmartMap, wrapPossiblePromise } from './utils';

export class Logger<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  private readonly globalContext: TGlobalContext;

  private readonly pluginManager: PluginManager<TTaskContext, TGlobalContext>;

  private readonly taskContextStorage: AsyncLocalStorage<Partial<TTaskContext>>;

  private readonly handlers: SmartMap<string, LogHandlerPlugin<TTaskContext, TGlobalContext>>;

  public constructor(
    globalContext: TGlobalContext,
    plugins: Plugin<TTaskContext, TGlobalContext>[] = [],
    pluginManager?: PluginManager<TTaskContext, TGlobalContext>,
  ) {
    this.globalContext = globalContext;
    this.pluginManager = pluginManager ?? new PluginManager();
    this.taskContextStorage = new AsyncLocalStorage();

    for (const plugin of plugins) {
      this.pluginManager.register(plugin);
    }

    this.pluginManager.init(this);

    this.handlers = new SmartMap(this.pluginManager.find(isLogHandlerPlugin).map((handler) => [
      handler.id,
      handler,
    ]));
  }

  public runTask<R>(callback: () => R, dontOverrideTask: boolean = false): R {
    const context = this.taskContextStorage.getStore();

    const envelopedCallback = () => {
      return wrapPossiblePromise(callback, {
        catch: (e) => {
          this.error(e);
          throw e;
        },
      });
    };

    if (context && dontOverrideTask) {
      return envelopedCallback();
    }

    const newContext: Partial<TTaskContext> = context ? clone(context) : {};

    const mainCallback = this.handlers.reduceRight(
      (child, parent) => (isTaskAwareLogHandlerPlugin(parent) ? () => parent.runTask(child) : child),
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
        message = sprintf(...(messageOrDataOrError as [string, ...any[]]));
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
    const fullEntry = {
      ...entry,
      taskContext: this.taskContextStorage.getStore(),
      globalContext: this.globalContext,
      ts: new Date(),
    };

    this.handlers.forEach((handler) => {
      handler.log(fullEntry);
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

  public hasPlugin(id: string): boolean {
    return this.pluginManager.has(id);
  }

  public getPlugin<ID extends PluginId>(id: ID): Plugins<TTaskContext, TGlobalContext>[ID] {
    return this.pluginManager.get(id);
  }

  public hasHandler(id: string): boolean {
    return this.handlers.has(id);
  }

  public getHandler(id: string): LogHandlerPlugin<TTaskContext, TGlobalContext> {
    const logHandler = this.handlers.get(id);

    if (!logHandler) {
      throw new Error(`Unknown plugin: ${id}`);
    }

    return logHandler;
  }
}
