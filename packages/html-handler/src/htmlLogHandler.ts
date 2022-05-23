import {
  TaskAwareLogHandler,
  TContextBase,
  LogEntry,
  PluginManager,
  TContextShape,
} from '@debugr/core';
import { AsyncLocalStorage } from 'async_hooks';
import { HtmlFormatter } from './htmlFormatter';
import { Writer } from './writer';
import { identifyQueue } from './utils';
import { LogEntryQueue, HtmlLogHandlerOptions } from './types';

export class HtmlLogHandler<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> extends TaskAwareLogHandler<Partial<TTaskContext>, TGlobalContext> {
  public readonly identifier: string = 'html';

  public readonly doesNeedFormatters: boolean = true;

  private formatter?: HtmlFormatter<Partial<TTaskContext>, TGlobalContext>;

  private readonly writer: Writer;

  private readonly options: HtmlLogHandlerOptions;

  private readonly asyncStorage: AsyncLocalStorage<
    LogEntryQueue<Partial<TTaskContext>, TGlobalContext>
  >;

  public constructor(
    writer: Writer,
    options: HtmlLogHandlerOptions,
    formatter?: HtmlFormatter<Partial<TTaskContext>, TGlobalContext>,
  ) {
    super();
    this.formatter = formatter;
    this.writer = writer;
    this.options = options;
    this.asyncStorage = new AsyncLocalStorage<
      LogEntryQueue<Partial<TTaskContext>, TGlobalContext>
    >();
  }

  public injectPluginManager(pluginManager: PluginManager<TContextShape, {}>): void {
    if (!this.formatter) {
      this.formatter = new HtmlFormatter<Partial<TTaskContext>, TGlobalContext>(pluginManager);
    }
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options: HtmlLogHandlerOptions,
  ): HtmlLogHandler<Partial<TTaskContext>, TGlobalContext> {
    return new HtmlLogHandler<Partial<TTaskContext>, TGlobalContext>(
      new Writer(options.outputDir),
      options,
    );
  }

  public log(entry: LogEntry<Partial<TTaskContext>, TGlobalContext>): void {
    const queue = this.asyncStorage.getStore();

    if (!queue) {
      return;
    }

    const entryId = queue.entries.length;

    queue.entries.push(entry);
    queue.lastTs = entry.ts;

    const threshold = queue.threshold !== undefined ? queue.threshold : this.options.threshold;

    if (entry.level >= threshold && queue.firstOverThreshold === undefined) {
      queue.firstOverThreshold = entryId;
    }
  }

  public runTask<R>(callback: () => R): () => R {
    const now = new Date();

    const queue: LogEntryQueue<Partial<TTaskContext>, TGlobalContext> = {
      entries: [],
      ts: now,
      lastTs: now,
    };

    return () => {
      return this.asyncStorage.run<R>(queue, callback);
    };
  }

  public flush(_processId?: string, forceWrite: boolean = false): void {
    const queue = this.asyncStorage.getStore();

    if (!queue) {
      return;
    }

    Promise.resolve().then(() => this.doFlushQueue(queue, forceWrite));
  }

  private async doFlushQueue(
    queue: LogEntryQueue<Partial<TTaskContext>, TGlobalContext>,
    forceWrite: boolean = false,
  ): Promise<void> {
    if (!this.formatter) {
      throw new Error('Logger was incorrectly initialized, no formatter found');
    }
    if (queue.id === undefined) {
      queue.id = identifyQueue(queue);
    }

    if (queue.write === undefined) {
      queue.write = queue.firstOverThreshold !== undefined;
    }

    if (forceWrite || queue.write) {
      const content = this.formatter.formatQueue(queue);
      await this.writer.write(queue.ts, queue.id, content);
    }
  }
}
