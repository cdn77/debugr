import type {
  LogEntry,
  ReadonlyRecursive,
  TaskAwareHandlerPlugin,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel } from '@debugr/core';
import { Client } from '@elastic/elasticsearch';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 } from 'uuid';
import type { ElasticHandlerOptions, ElasticOptions } from './types';

export class ElasticHandler<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>
  implements TaskAwareHandlerPlugin<TTaskContext, TGlobalContext>
{
  public readonly id: string = 'elastic';
  public readonly kind = 'handler' as const;
  private readonly elasticClient: Client;
  private readonly options: ElasticHandlerOptions<TTaskContext, TGlobalContext>;
  private readonly threshold: LogLevel | number;
  private readonly asyncStorage: AsyncLocalStorage<string[]>;
  private lastError?: Date;

  public constructor(options: ElasticOptions<TTaskContext, TGlobalContext>);
  public constructor(
    options: ElasticHandlerOptions<TTaskContext, TGlobalContext>,
    elasticClient: Client,
  );
  public constructor(options: any, elasticClient?: Client) {
    this.options = options;
    this.elasticClient = elasticClient ?? new Client(options);
    this.threshold = options.threshold ?? LogLevel.TRACE;
    this.asyncStorage = new AsyncLocalStorage();
  }

  public runTask<R>(callback: () => R): R {
    const stack: string[] = [...(this.asyncStorage.getStore() || []), v4()];

    return this.asyncStorage.run(stack, callback);
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    if (entry.level < this.threshold) {
      return;
    }

    try {
      await this.elasticClient.index({
        index:
          typeof this.options.index === 'string' ? this.options.index : this.options.index(entry),
        body: this.options.bodyMapper
          ? this.options.bodyMapper(entry)
          : this.defaultBodyMapper(entry),
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
      context: {
        ...globalContext,
        ...(taskContext || {}),
        subtaskIds: this.asyncStorage.getStore(),
      },
      data: JSON.stringify(data),
    };
  }
}
