import { LogEntry, LogEntryQueue } from '../queues';

export interface Events {
  'queue.push': (entry: LogEntry, queue: LogEntryQueue) => void;
  'queue.flush': (queue: LogEntryQueue) => void;
  'queue.write': (queue: LogEntryQueue) => void;
}
