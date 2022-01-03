import { AsyncLocalStorage } from 'async_hooks';
import { QueueManager } from '../queues';
import { LogLevel } from '../types';
import { PluginId } from '../plugins';
import { LoggerInterface } from './loggerInterface';

export class Logger implements LoggerInterface {
  private readonly queueManager: QueueManager;

  private readonly globalLogger?: LoggerInterface;

  private readonly context: AsyncLocalStorage<string>;

  constructor(queueManager: QueueManager, globalLogger?: LoggerInterface) {
    this.queueManager = queueManager;
    this.globalLogger = globalLogger;
    this.context = new AsyncLocalStorage();
  }

  ensureFork<R>(callback: () => R): R {
    const tag = this.context.getStore();

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

    const tag = this.context.getStore();

    if (tag && !force) {
      throw new Error('Logger is already forked');
    }

    return this.context.run(this.queueManager.createQueue(), callback);
  }

  forkInline(): void {
    this.context.enterWith(this.queueManager.createQueue());
  }

  debug(data: Record<string, any>): void;
  debug(message: string, data?: Record<string, any>): void;
  debug(message: string, params?: any[], data?: Record<string, any>): void;
  debug(message: any, params?: any[], data?: Record<string, any>): void {
    this.log(Logger.DEBUG, message, params, data);
  }

  info(data: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  info(message: string, params?: any[], data?: Record<string, any>): void;
  info(message: any, params?: any[], data?: Record<string, any>): void {
    this.log(Logger.INFO, message, params, data);
  }

  warning(data: Record<string, any>): void;
  warning(message: string, data?: Record<string, any>): void;
  warning(message: string, params?: any[], data?: Record<string, any>): void;
  warning(message: any, params?: any[], data?: Record<string, any>): void {
    this.log(Logger.WARNING, message, params, data);
  }

  error(data: Record<string, any>): void;
  error(message: string, data?: Record<string, any>): void;
  error(message: string, params?: any[], data?: Record<string, any>): void;
  error(message: any, params?: any[], data?: Record<string, any>): void {
    this.log(Logger.ERROR, message, params, data);
  }

  log(level: number, data: Record<string, any>): void;
  log(level: number, message: string, data?: Record<string, any>): void;
  log(level: number, message: string, params?: any[], data?: Record<string, any>): void;
  log(plugin: PluginId, level: number, data: Record<string, any>): void;
  log(plugin: PluginId, level: number, message: string, data?: Record<string, any>): void;
  log(
    plugin: PluginId,
    level: number,
    message: string,
    params?: any[],
    data?: Record<string, any>,
  ): void;
  log(
    pluginOrLevel: any,
    levelOrMessage: any,
    messageOrParams?: any,
    paramsOrData?: any[],
    maybeData?: Record<string, any>,
  ): void {
    const tag = this.context.getStore();

    if (tag) {
      this.queueManager.log(
        tag,
        pluginOrLevel,
        levelOrMessage,
        messageOrParams,
        paramsOrData,
        maybeData,
      );
    } else if (this.globalLogger) {
      this.globalLogger.log(
        pluginOrLevel,
        levelOrMessage,
        messageOrParams,
        paramsOrData,
        maybeData,
      );
    }
  }

  setId(id: string): void {
    const tag = this.context.getStore();
    tag && this.queueManager.setQueueId(tag, id);
  }

  setThreshold(threshold: number): void {
    const tag = this.context.getStore();
    tag && this.queueManager.setQueueThreshold(tag, threshold);
  }

  markForWriting(): void {
    const tag = this.context.getStore();
    tag && this.queueManager.markQueueForWriting(tag);
  }

  markAsIgnored(): void {
    const tag = this.context.getStore();
    tag && this.queueManager.markQueueIgnored(tag);
  }

  flush(): void {
    const tag = this.context.getStore();
    tag && this.queueManager.flushQueue(tag);
  }
}

export namespace Logger {
  export const { DEBUG, INFO, WARNING, ERROR } = LogLevel;
}
