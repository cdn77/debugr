import { vsprintf } from 'printj';
import * as v8 from 'v8';
import { EventDispatcher } from '../events';
import { PluginId } from '../plugins';
import { Formatter } from '../formatter';
import { Writer } from './writer';
import { generateIdentifier } from '../bootstrap/utils';
import { identifyQueue } from './utils';
import { LogEntry, LogEntryQueue, QueueManagerOptions } from './types';
import { With } from '../types';

export class QueueManager {
  private readonly eventDispatcher: EventDispatcher;

  private readonly formatter: Formatter;

  private readonly writer: Writer;

  private readonly options: QueueManagerOptions;

  private readonly gcTmr: NodeJS.Timeout;

  private readonly queues: Record<string, LogEntryQueue>;

  constructor(
    eventDispatcher: EventDispatcher,
    formatter: Formatter,
    writer: Writer,
    options: QueueManagerOptions,
  ) {
    this.eventDispatcher = eventDispatcher;
    this.formatter = formatter;
    this.writer = writer;
    this.options = options;
    this.queues = {};
    this.gcTmr = setInterval(() => this.gc(), this.options.gc.interval * 1000);
    this.gcTmr.unref();
  }

  log(tag: string, level: number, data: Record<string, any>): void;
  log(tag: string, level: number, message: string, data?: Record<string, any>): void;
  log(
    tag: string,
    level: number,
    message: string,
    params?: any[],
    data?: Record<string, any>,
  ): void;
  log(tag: string, plugin: PluginId, level: number, data: Record<string, any>): void;
  log(
    tag: string,
    plugin: PluginId,
    level: number,
    message: string,
    data?: Record<string, any>,
  ): void;
  log(
    tag: string,
    plugin: PluginId,
    level: number,
    message: string,
    params?: any[],
    data?: Record<string, any>,
  ): void;
  log(tag: string, ...args: any): void {
    if (!(tag in this.queues)) {
      return;
    }

    const ts = Date.now();

    const [plugin, level, message, data] = normalizeLogArgs(args);
    const queue = this.queues[tag];
    const entryId = queue.entries.length;

    const entry: LogEntry = {
      plugin,
      message,
      data: data && this.options.cloneData ? v8.deserialize(v8.serialize(data)) : data,
      level,
      ts,
    };

    this.eventDispatcher.emit('queue.push', entry, queue);
    queue.entries.push(entry);
    queue.lastTs = ts;

    const threshold = queue.threshold !== undefined ? queue.threshold : this.options.threshold;

    if (level >= threshold && queue.firstOverThreshold === undefined) {
      queue.firstOverThreshold = entryId;
    }
  }

  createQueue(): string {
    const now = Date.now();
    const tag = generateIdentifier(this.queues);

    this.queues[tag] = {
      entries: [],
      ts: now,
      lastTs: now,
    };

    return tag;
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

  flushQueue(tag: string, forceWrite: boolean = false): void {
    if (tag in this.queues) {
      const queue = this.queues[tag];
      delete this.queues[tag];
      Promise.resolve().then(() => this.doFlushQueue(queue, forceWrite));
    }
  }

  private async doFlushQueue(queue: LogEntryQueue, forceWrite: boolean = false): Promise<void> {
    if (queue.id === undefined) {
      queue.id = identifyQueue(queue);
    }

    this.eventDispatcher.emit('queue.flush', queue as With<LogEntryQueue, 'id'>);

    if (queue.write === undefined) {
      queue.write = queue.firstOverThreshold !== undefined;
    }

    if (forceWrite || queue.write) {
      const content = this.formatter.format(queue);
      const url = await this.writer.write(queue.ts, queue.id, content);
      this.eventDispatcher.emit('queue.write', url);
    }
  }

  private gc(): void {
    const threshold = Date.now() - this.options.gc.threshold * 1000;

    for (const [tag, queue] of Object.entries(this.queues)) {
      if (queue.lastTs < threshold) {
        this.log(tag, -1, 'Queue was flushed by GC');
        this.flushQueue(tag);
      }
    }
  }
}

type LogArgs =
  | [string | number, any]
  | [string | number, any, any]
  | [string | number, any, any, any]
  | [string | number, any, any, any, any];

function normalizeLogArgs([a, b, c, d, e]: LogArgs): [
  PluginId | undefined,
  number,
  string | undefined,
  Record<string, any> | undefined,
] {
  const [plugin, level, messageOrDataOrError, paramsOrData, maybeData] =
    typeof a === 'string' ? [a, b, c, d, e] : [undefined, a, b, c, d];

  if (messageOrDataOrError instanceof Error) {
    const message = `${messageOrDataOrError.name}: ${messageOrDataOrError.message}`;
    const data = typeof paramsOrData === 'object' ? paramsOrData : {};
    data.stack = messageOrDataOrError.stack;
    return [plugin, level, message, data];
  } else if (typeof messageOrDataOrError === 'string') {
    const message = Array.isArray(paramsOrData)
      ? vsprintf(messageOrDataOrError, paramsOrData)
      : messageOrDataOrError;
    const data = Array.isArray(paramsOrData) ? maybeData : paramsOrData;
    return [plugin, level, message, data];
  } else {
    return [plugin, level, undefined, messageOrDataOrError];
  }
}
