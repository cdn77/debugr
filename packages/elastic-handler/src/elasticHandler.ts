import { Client, ClientOptions } from '@elastic/elasticsearch';

import { LogEntry, LogLevel, TContextBase, LogHandler, TContextShape } from '@debugr/core';

export interface ElasticHandlerOptions<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> {
  threshold: LogLevel | number;
  index: string | ((entry: LogEntry<TTaskContext, TGlobalContext>) => string);
  errorCallback?: (error: Error) => void;
  bodyMapper?: (entry: LogEntry<TTaskContext, TGlobalContext>) => Record<string, any>;
  errorMsThreshold?: number;
}

export type ElasticOptions<
  TTaskContext extends TContextBase = TContextShape,
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
    const instance = new ElasticHandler<TTaskContext, TGlobalContext>(opts, new Client(opts));
    return instance;
  }

  log(entry: LogEntry<TTaskContext, TGlobalContext>): void {
    this.elasticClient
      .index({
        index:
          typeof this.opts.index === 'string'
            ? this.defaultIndexCallback(entry)
            : this.opts.index(entry),
        body: this.opts.bodyMapper ? this.opts.bodyMapper(entry) : this.defaultBodyParser(entry),
      })
      .catch((error) =>
        this.opts.errorCallback ? this.opts.errorCallback(error) : this.defaultErrorCallback(error),
      );
  }

  private defaultIndexCallback(entry: LogEntry<TTaskContext, TGlobalContext>): string {
    return entry.level === 10
      ? `${this.opts.index}-trace-${new Date().toISOString().split('T')[0]}`
      : `${this.opts.index}-log-${new Date().toISOString().split('T')[0]}`;
  }

  private defaultErrorCallback(error: Error): void {
    if (this.opts.errorMsThreshold) {
      if (
        !this.lastError ||
        this.lastError.getTime() - new Date().getTime() > this.opts.errorMsThreshold
      ) {
        console.log('ELASTIC CONNECTION ERROR HAPPENED', error);
        this.lastError = new Date();
      }
    } else {
      console.log('ELASTIC CONNECTION ERROR HAPPENED', error);
    }
  }

  private defaultBodyParser(entry: LogEntry<TTaskContext, TGlobalContext>): Record<string, any> {
    return {
      ...entry,
      data: JSON.stringify(entry.data),
    };
  }
}
