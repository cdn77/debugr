import { Client, ClientOptions } from '@elastic/elasticsearch';

import { LogEntry, LogLevel, TContextBase, LogHandler } from '@debugr/core';

export interface ElasticHandlerOptions<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  baseIndex?: string;
  threshold: LogLevel | number;
  indexCallback?: (entry: LogEntry<TContext, TGlobalContext>) => string;
  errorCallback?: (error: Error) => void;
  bodyParser?: (entry: LogEntry<TContext, TGlobalContext>) => Record<string, any>;
  errorMsThreshold?: number;
}

export type ElasticOptions<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> = {} & ClientOptions & ElasticHandlerOptions<TContext, TGlobalContext>;

export class ElasticHandler<
  TContext extends TContextBase,
  TGlobalContext extends Record<string, any>,
> extends LogHandler<TContext> {
  public readonly identifier: string = 'elastic';

  public readonly doesNeedFormatters: boolean = false;

  public readonly threshold: LogLevel | number;

  private readonly elasticClient: Client;

  private readonly opts: ElasticHandlerOptions<TContext, TGlobalContext>;

  private lastError?: Date;

  constructor(opts: ElasticHandlerOptions<TContext, TGlobalContext>, elasticClient: Client) {
    super();
    if (!opts.baseIndex && !opts.indexCallback) {
      throw new Error('baseIndex or indexCallback must be set');
    }
    this.threshold = opts.threshold;
    this.opts = opts;
    this.elasticClient = elasticClient;
  }

  public static create<TContext extends TContextBase, TGlobalContext extends Record<string, any>>(
    opts: ElasticOptions<TContext, TGlobalContext>,
  ): ElasticHandler<TContext, TGlobalContext> {
    const instance = new ElasticHandler<TContext, TGlobalContext>(opts, new Client(opts));
    return instance;
  }

  log(entry: LogEntry<TContext, TGlobalContext>): void {
    this.elasticClient
      .index({
        index: this.opts.indexCallback
          ? this.opts.indexCallback(entry)
          : this.defaultIndexCallback(entry),
        body: this.opts.bodyParser ? this.opts.bodyParser(entry) : this.defaultBodyParser(entry),
      })
      .catch((error) =>
        this.opts.errorCallback ? this.opts.errorCallback(error) : this.defaultErrorCallback(error),
      );
  }

  private defaultIndexCallback(entry: LogEntry<TContext, TGlobalContext>): string {
    return entry.level === 10
      ? `${this.opts.baseIndex}-trace-${new Date().toISOString().split('T')[0]}`
      : `${this.opts.baseIndex}-log-${new Date().toISOString().split('T')[0]}`;
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

  private defaultBodyParser(entry: LogEntry<TContext, TGlobalContext>): Record<string, any> {
    return {
      ...entry,
      data: JSON.stringify(entry.data),
    };
  }

  flush = undefined;
}
