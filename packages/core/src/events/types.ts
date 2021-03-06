import { LogEntry, LogEntryQueue } from '../queues';
import { With } from '../types';

export interface Events {
  'queue.push': (entry: LogEntry, queue: LogEntryQueue) => void;
  'queue.flush': (queue: With<LogEntryQueue, 'id'>) => void;
  'queue.write': (url: string) => void;
}
