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

export function identify(queue: LogEntryQueue): string {
  if (queue.id) {
    return queue.id;
  }

  const definingEntry = findDefiningEntry(queue);

  const data = JSON.stringify([definingEntry.level, definingEntry.message, definingEntry.data]);

  const sha1 = crypto.createHash('sha1');
  sha1.update(data);
  return sha1.digest('hex').substring(0, 16);
}
