import * as crypto from 'crypto';
import { LogEntry, LogEntryQueue } from './types';

export function findDefiningEntry(queue: LogEntryQueue): LogEntry {
  if (queue.firstOverThreshold !== undefined) {
    return queue.entries[queue.firstOverThreshold];
  } else if (!queue.entries.length) {
    return {
      ts: 0,
      level: 4,
      message: 'EMPTY QUEUE!',
      data: queue,
    };
  }

  return queue.entries.reduce((a, b) => (b.level > a.level ? b : a));
}

export function identifyQueue(queue: LogEntryQueue): string {
  const entry = findDefiningEntry(queue);
  const key = JSON.stringify([entry.level, entry.message, entry.data]);
  const sha1 = crypto.createHash('sha1');
  sha1.update(key);
  return sha1.digest('hex').substring(0, 16);
}
