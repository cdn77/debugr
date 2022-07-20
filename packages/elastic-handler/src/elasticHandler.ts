import { Client, ClientOptions } from '@elastic/elasticsearch';

import {
  LogEntry,
  LogLevel,
  TContextBase,
  LogHandler,
  TContextShape,
  ReadonlyRecursive,
  clone,
} from '@debugr/core';

export interface ElasticHandlerOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  threshold: LogLevel | number;
  index: string | ((entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>) => string);
  errorCallback?: (error: Error) => void;
  bodyMapper?: (
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ) => Record<string, any>;
  errorMsThreshold?: number;
}

export type ElasticOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> = {} & ClientOptions & ElasticHandlerOptions<TTaskContext, TGlobalContext>;

export class ElasticHandler<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
> extends LogHandler<TTaskContext> {
  public readonly identifier: string = 'elastic';

  public readonly doesNeedFormatters: boolean = false;

  public readonly threshold: LogLevel | number;

  private readonly elasticClient: Client;

  private readonly opts: ElasticHandlerOptions<TTaskContext, TGlobalContext>;

  private lastError?: Date;

  constructor(opts: ElasticHandlerOptions<TTaskContext, TGlobalContext>, elasticClient: Client) {
    super();
    this.threshold = opts.threshold;
    this.opts = opts;
    this.elasticClient = elasticClient;
  }

  public injectPluginManager(): void {}

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    opts: ElasticOptions<TTaskContext, TGlobalContext>,
  ): ElasticHandler<TTaskContext, TGlobalContext> {
    return new ElasticHandler<TTaskContext, TGlobalContext>(opts, new Client(opts));
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    try {
      await this.elasticClient.index({
        index: typeof this.opts.index === 'string' ? this.opts.index : this.opts.index(entry),
        body: this.opts.bodyMapper ? this.opts.bodyMapper(entry) : this.defaultBodyMapper(entry),
      });
    } catch (error) {
      if (this.opts.errorMsThreshold) {
        if (
          !this.lastError ||
          this.lastError.getTime() - new Date().getTime() > this.opts.errorMsThreshold
        ) {
          if (this.opts.errorCallback) {
            this.opts.errorCallback(error);
          } else {
            console.log('ELASTIC CONNECTION ERROR HAPPENED', error);
            this.lastError = new Date();
          }
        }
      } else if (this.opts.errorCallback) {
        this.opts.errorCallback(error);
      } else {
        console.log('ELASTIC CONNECTION ERROR HAPPENED', error);
      }
    }
  }

  private defaultBodyMapper({
    data,
    taskContext,
    globalContext,
    ...entry
  }: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): Record<string, any> {
    return {
      ...entry,
      context: clone({ ...(taskContext || {}), ...globalContext }),
      data: JSON.stringify(data),
    };
  }
}
