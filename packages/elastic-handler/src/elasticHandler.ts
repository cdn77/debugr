import type {
  LogEntry,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { clone, LogLevel, TaskAwareLogHandler } from '@debugr/core';
import { Client } from '@elastic/elasticsearch';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 } from 'uuid';
import type { ElasticHandlerOptions, ElasticOptions } from './types';

export class ElasticHandler<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
> extends TaskAwareLogHandler<TTaskContext> {
  public readonly identifier: string = 'elastic';

  public readonly doesNeedFormatters: boolean = false;

  public readonly threshold: LogLevel | number;

  private readonly elasticClient: Client;

  private readonly options: ElasticHandlerOptions<TTaskContext, TGlobalContext>;

  private readonly asyncStorage: AsyncLocalStorage<string[]>;

  private lastError?: Date;

  constructor(options: ElasticHandlerOptions<TTaskContext, TGlobalContext>, elasticClient: Client) {
    super();
    this.threshold = options.threshold ?? LogLevel.TRACE;
    this.options = options;
    this.elasticClient = elasticClient;
  }

  public injectPluginManager(): void {}

  public flush(): void {
    //
  }

  public runTask<R>(callback: () => R): R {
    const stack: string[] = [
      ...this.asyncStorage.getStore() || [],
      v4(),
    ];

    return this.asyncStorage.run(stack, callback);
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options: ElasticOptions<TTaskContext, TGlobalContext>,
  ): ElasticHandler<TTaskContext, TGlobalContext> {
    return new ElasticHandler<TTaskContext, TGlobalContext>(options, new Client(options));
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    try {
      await this.elasticClient.index({
        index: typeof this.options.index === 'string' ? this.options.index : this.options.index(entry),
        body: this.options.bodyMapper ? this.options.bodyMapper(entry) : this.defaultBodyMapper(entry),
      });
    } catch (error) {
      if (this.options.errorMsThreshold) {
        if (
          !this.lastError ||
          this.lastError.getTime() - new Date().getTime() > this.options.errorMsThreshold
        ) {
          if (this.options.errorCallback) {
            this.options.errorCallback(error);
          } else {
            console.log('ELASTIC CONNECTION ERROR HAPPENED', error);
            this.lastError = new Date();
          }
        }
      } else if (this.options.errorCallback) {
        this.options.errorCallback(error);
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
      context: clone({ ...(taskContext || {}), ...globalContext, subtaskIds: this.asyncStorage.getStore() }),
      data: JSON.stringify(data),
    };
  }
}
