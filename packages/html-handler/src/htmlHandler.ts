import { LogHandler, TContextBase, LogEntry } from '@debugr/core';
import { AsyncLocalStorage } from 'async_hooks';
import { HtmlFormatter } from './htmlFormatter';
import { Writer } from './writer';
import { identifyQueue } from './utils';
import { LogEntryQueue, HtmlLogHandlerOptions } from './types';

export class HtmlLogHandler<
  TContext extends TContextBase = {
    processId: string;
  },
  TGlobalContext extends Record<string, any> = {},
> extends LogHandler<Partial<TContext>, TGlobalContext> {
  public readonly identifier: string = 'html';

  public readonly doesNeedFormatters: boolean = true;

  private readonly formatter: HtmlFormatter<Partial<TContext>, TGlobalContext>;

  private readonly writer: Writer;

  private readonly options: HtmlLogHandlerOptions;

  private readonly gcTmr: NodeJS.Timeout;

  private readonly asyncStorage: AsyncLocalStorage<
    LogEntryQueue<Partial<TContext>, TGlobalContext>
  >;

  public constructor(
    formatter: HtmlFormatter<Partial<TContext>, TGlobalContext>,
    writer: Writer,
    options: HtmlLogHandlerOptions,
  ) {
    super();
    this.formatter = formatter;
    this.writer = writer;
    this.options = options;
    this.asyncStorage = new AsyncLocalStorage<LogEntryQueue<Partial<TContext>, TGlobalContext>>();
    this.gcTmr = setInterval(() => this.gc(), this.options.gc.interval * 1000);
    this.gcTmr.unref();
  }

  public log(entry: LogEntry<Partial<TContext>, TGlobalContext>): void {
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

  public fork<R>(callback: () => R): () => R {
    const now = new Date();

    const queue: LogEntryQueue<Partial<TContext>, TGlobalContext> = {
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
    queue: LogEntryQueue<Partial<TContext>, TGlobalContext>,
    forceWrite: boolean = false,
  ): Promise<void> {
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

  private gc(): void {
    const queue = this.asyncStorage.getStore();

    if (!queue) {
      return;
    }

    const threshold = Date.now() - this.options.gc.threshold * 1000;

    if (queue.lastTs.getTime() < threshold) {
      this.log({
        context: { processId: queue.entries[0].context.processId } as TContext & TGlobalContext,
        level: -1,
        message: 'Queue was flushed by GC',
        ts: new Date(),
      });
      this.flush(undefined, true);
    }
  }
}
