import type {
  HandlerPlugin,
  LogEntry,
  Logger,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel, PluginKind } from '@debugr/core';
import { Client } from '@elastic/elasticsearch';
import type { ElasticHandlerOptions, ElasticOptions } from './types';

export class ElasticHandler<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>
  implements HandlerPlugin<TTaskContext, TGlobalContext>
{
  public readonly id = 'elastic';
  public readonly kind = PluginKind.Handler;

  private readonly elasticClient: Client;
  private readonly options: ElasticHandlerOptions<TTaskContext, TGlobalContext>;
  private readonly threshold: LogLevel;
  private readonly localErrors: WeakSet<Error>;
  private logger?: Logger;

  public constructor(options: ElasticOptions<TTaskContext, TGlobalContext>);
  public constructor(
    options: ElasticHandlerOptions<TTaskContext, TGlobalContext>,
    elasticClient: Client,
  );
  public constructor(options: any, elasticClient?: Client) {
    this.options = options;
    this.elasticClient = elasticClient ?? new Client(options);
    this.threshold = options.threshold ?? LogLevel.ALL;
    this.localErrors = new WeakSet();
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    if (
      (entry.level >= LogLevel.ALL && entry.level < this.threshold) ||
      (entry.error && this.localErrors.has(entry.error))
    ) {
      return;
    }

    try {
      const body = this.options.transformer
        ? this.options.transformer(entry)
        : this.defaultTransformer(entry);

      if (!body) {
        return;
      }

      const index =
        typeof this.options.index === 'string' ? this.options.index : this.options.index(entry);

      await this.elasticClient.index({ index, body });
    } catch (error) {
      this.localErrors.add(error);
      this.logger?.log(LogLevel.INTERNAL, error);
    }
  }

  private defaultTransformer({
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
      },
      data: JSON.stringify(data),
    };
  }
}
