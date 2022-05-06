import { Client, ClientOptions } from '@elastic/elasticsearch';

import { LogEntry, LogLevel, TContextBase, LogHandler } from '@debugr/core';

export interface ElasticOptions extends ClientOptions {
  baseIndex: string;
  errorMsThreshold?: number;
}

export class ElasticLogger<
  TContext extends TContextBase,
  TGlobalContext extends Record<string, any>,
> extends LogHandler<TContext> {
  private readonly elasticClient: Client;

  private readonly opts: ElasticOptions;

  public readonly threshold: LogLevel | number;

  private lastError?: Date;

  constructor(threshold: LogLevel | number, opts: ElasticOptions) {
    super();
    this.threshold = threshold;
    this.opts = opts;
    this.elasticClient = new Client(opts);
  }

  log(entry: LogEntry<TContext, TGlobalContext>): void {
    this.elasticClient
      .index({
        index:
          entry.level === 10
            ? `${this.opts.baseIndex}-trace-${new Date().toISOString().split('T')[0]}`
            : `${this.opts.baseIndex}-log-${new Date().toISOString().split('T')[0]}`,
        body: entry,
      })
      .catch((e) => {
        if (this.opts.errorMsThreshold) {
          if (
            !this.lastError ||
            this.lastError.getTime() - new Date().getTime() > this.opts.errorMsThreshold
          ) {
            console.log('ELASTIC CONNECTION ERROR HAPPENED', e);
            this.lastError = new Date();
          }
        } else {
          console.log('ELASTIC CONNECTION ERROR HAPPENED', e);
        }
      });
  }

  flush = undefined;
}
