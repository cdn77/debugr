import { AsyncLocalStorage } from 'async_hooks';
import { sprintf } from 'printj';
import { PluginManager } from './pluginManager';
import type {
CloningStrategy,  HandlerPlugin,
  LogEntry,
  LoggerOptions,
  PluginId,
  Plugins,
  TContextBase,
  TContextShape
} from './types';
import { isHandlerPlugin, isTaskAwareHandlerPlugin, LogLevel } from './types';
import { SmartMap, snapshot, wrapPossiblePromise } from './utils';

export class Logger<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  private readonly globalContext: TGlobalContext;
  private readonly pluginManager: PluginManager<TTaskContext, TGlobalContext>;
  private readonly cloningStrategy?: CloningStrategy;
  private readonly taskContextStorage: AsyncLocalStorage<Partial<TTaskContext>>;
  private readonly handlers: SmartMap<string, HandlerPlugin<TTaskContext, TGlobalContext>>;

  public constructor({
    globalContext,
    plugins = [],
    pluginManager = new PluginManager(),
    cloningStrategy,
  }: LoggerOptions<TTaskContext, TGlobalContext>) {
    this.globalContext = globalContext;
    this.pluginManager = pluginManager;
    this.cloningStrategy = cloningStrategy;
    this.taskContextStorage = new AsyncLocalStorage();

    for (const plugin of plugins) {
      this.pluginManager.register(plugin);
    }

    this.pluginManager.init(this);

    this.handlers = new SmartMap(
      this.pluginManager.find(isHandlerPlugin).map((handler) => [handler.id, handler]),
    );
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

    const newContext: Partial<TTaskContext> = context ? snapshot.v8(context) : {};

    const mainCallback = this.handlers.reduceRight(
      (child, parent) => (isTaskAwareHandlerPlugin(parent) ? () => parent.runTask(child) : child),
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

  public log(level: LogLevel, data: Record<string, any> | Error): this;
  public log(level: LogLevel, message: string | [string, ...any], data?: Record<string, any>): this;
  public log(
    level: LogLevel,
    message: string | [string, ...any],
    error: Error,
    data?: Record<string, any>,
  ): this;
  public log(
    level: LogLevel,
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

    if (this.cloningStrategy && !snapshot.isSnapshot(data)) {
      data = snapshot.take(data, this.cloningStrategy);
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

    for (const handler of this.handlers.values()) {
      handler.log(fullEntry);
    }

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
}
