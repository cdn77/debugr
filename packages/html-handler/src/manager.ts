import { LogHandler, TContextBase, LogEntry } from '@debugr/core';
import { HtmlFormatter } from './htmlFormatter';
import { Writer } from './writer';
import { identifyQueue } from './utils';
import { LogEntryQueue, QueueManagerOptions } from './types';

export class QueueManager<
  TContext extends TContextBase = {
    processId: string;
  },
  TGlobalContext extends Record<string, any> = {},
> extends LogHandler<TContext, TGlobalContext> {
  private readonly formatter: HtmlFormatter;

  private readonly writer: Writer;

  private readonly options: QueueManagerOptions;

  private readonly gcTmr: NodeJS.Timeout;

  private readonly queues: Record<string, LogEntryQueue>;

  constructor(formatter: HtmlFormatter, writer: Writer, options: QueueManagerOptions) {
    super();
    this.formatter = formatter;
    this.writer = writer;
    this.options = options;
    this.queues = {};
    this.gcTmr = setInterval(() => this.gc(), this.options.gc.interval * 1000);
    this.gcTmr.unref();
  }

  log(entry: LogEntry<TContext, TGlobalContext>): void {
    // TODO
    if (!entry?.context?.processId || !(entry.context!.processId! in this.queues)) {
      return;
    }

    const queue = this.queues[entry.context!.processId!];
    const entryId = queue.entries.length;

    queue.entries.push(entry);
    queue.lastTs = entry.ts;

    const threshold = queue.threshold !== undefined ? queue.threshold : this.options.threshold;

    if (entry.level >= threshold && queue.firstOverThreshold === undefined) {
      queue.firstOverThreshold = entryId;
    }
  }

  createQueue(processId: string): void {
    const now = new Date();

    this.queues[processId] = {
      entries: [],
      ts: now,
      lastTs: now,
    };
  }

  setQueueId(tag: string, id: string): void {
    if (tag in this.queues) {
      if (this.queues[tag].id !== undefined) {
        throw new Error('Queue already has an ID');
      } else if (!/^[a-z0-9-/]+$/i.test(id)) {
        throw new Error('Invalid queue ID, must conform to "^[a-z0-9-/]+$"');
      }

      this.queues[tag].id = id;
    }
  }

  setQueueThreshold(tag: string, threshold: number): void {
    if (tag in this.queues) {
      this.queues[tag].threshold = threshold;
    }
  }

  markQueueForWriting(tag: string, force: boolean = false): void {
    if (tag in this.queues && (force || this.queues[tag].write === undefined)) {
      this.queues[tag].write = true;
    }
  }

  markQueueIgnored(tag: string, force: boolean = false): void {
    if (tag in this.queues && (force || this.queues[tag].write === undefined)) {
      this.queues[tag].write = false;
    }
  }

  public flush(processId: string, forceWrite: boolean = false): void {
    if (processId in this.queues) {
      const queue = this.queues[processId];
      delete this.queues[processId];
      Promise.resolve().then(() => this.doFlushQueue(queue, forceWrite));
    }
  }

  private async doFlushQueue(queue: LogEntryQueue, forceWrite: boolean = false): Promise<void> {
    if (queue.id === undefined) {
      queue.id = identifyQueue(queue);
    }

    // this.eventDispatcher.emit('queue.flush', queue as With<LogEntryQueue, 'id'>);

    if (queue.write === undefined) {
      queue.write = queue.firstOverThreshold !== undefined;
    }

    if (forceWrite || queue.write) {
      const content = this.formatter.formatQueue(queue);
      await this.writer.write(queue.ts, queue.id, content);
      // this.eventDispatcher.emit('queue.write', url);
    }
  }

  private gc(): void {
    const threshold = Date.now() - this.options.gc.threshold * 1000;

    for (const [processId, queue] of Object.entries(this.queues)) {
      if (queue.lastTs.getTime() < threshold) {
        this.log({
          context: { processId } as TContext & TGlobalContext,
          level: -1,
          message: 'Queue was flushed by GC',
          ts: new Date(),
        });
        this.flush(processId, true);
      }
    }
  }
}
