import { QueueManager } from './queues';
import { LogLevel } from './types';
// import { PluginId } from './plugins';

export class Logger {
  private readonly queueManager: QueueManager;

  private readonly tag: string;

  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
    this.tag = this.queueManager.createQueue();
  }

  getTag(): string {
    return this.tag;
  }

  debug(data: Record<string, any>): void;
  debug(message: string, data?: Record<string, any>): void;
  debug(message: string, params?: any[], data?: Record<string, any>): void;
  debug(message: any, params?: any[], data?: Record<string, any>): void {
    this.queueManager.log(this.tag, Logger.DEBUG, message, params, data);
  }

  info(data: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  info(message: string, params?: any[], data?: Record<string, any>): void;
  info(message: any, params?: any[], data?: Record<string, any>): void {
    this.queueManager.log(this.tag, Logger.INFO, message, params, data);
  }

  warning(data: Record<string, any>): void;
  warning(message: string, data?: Record<string, any>): void;
  warning(message: string, params?: any[], data?: Record<string, any>): void;
  warning(message: any, params?: any[], data?: Record<string, any>): void {
    this.queueManager.log(this.tag, Logger.WARNING, message, params, data);
  }

  error(data: Record<string, any>): void;
  error(message: string, data?: Record<string, any>): void;
  error(message: string, params?: any[], data?: Record<string, any>): void;
  error(message: any, params?: any[], data?: Record<string, any>): void {
    this.queueManager.log(this.tag, Logger.ERROR, message, params, data);
  }

  log(level: number, data: Record<string, any>): void;
  log(level: number, message: string, data?: Record<string, any>): void;
  log(level: number, message: string, params?: any[], data?: Record<string, any>): void;
  /*
  log(plugin: PluginId, level: number, data: Record<string, any>): void;
  log(plugin: PluginId, level: number, message: string, data?: Record<string, any>): void;
  log(
    plugin: PluginId,
    level: number,
    message: string,
    params?: any[],
    data?: Record<string, any>,
  ): void;
  */
  log(
    pluginOrLevel: any,
    levelOrMessage: any,
    messageOrParams?: any,
    paramsOrData?: any[],
    maybeData?: Record<string, any>,
  ): void {
    this.queueManager.log(
      this.tag,
      pluginOrLevel,
      levelOrMessage,
      messageOrParams,
      paramsOrData,
      maybeData,
    );
  }

  setId(id: string): void {
    this.queueManager.setQueueId(this.tag, id);
  }

  markForWriting(): void {
    this.queueManager.markQueueForWriting(this.tag);
  }

  markAsIgnored(): void {
    this.queueManager.markQueueIgnored(this.tag);
  }

  flush(): void {
    this.queueManager.flushQueue(this.tag);
  }
}

export namespace Logger {
  export const { DEBUG, INFO, WARNING, ERROR } = LogLevel;
}
