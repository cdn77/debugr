import * as crypto from 'crypto';
import { v4 } from 'node-uuid';

import { LogEntry, TContextBase, TContextShape } from '@debugr/core';
import { LogEntryQueue } from './types';

export function findDefiningEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
>(
  queue: LogEntryQueue<Partial<TTaskContext>, TGlobalContext>,
): LogEntry<Partial<TTaskContext>, TGlobalContext> {
  if (queue.firstOverThreshold !== undefined) {
    return queue.entries[queue.firstOverThreshold];
  } else if (!queue.entries.length) {
    return {
      ts: new Date(0),
      level: 4,
      // @ts-ignore
      context: {
        processId: v4(),
      },
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
