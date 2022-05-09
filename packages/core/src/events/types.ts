import { LogEntry } from '../logger';

export interface Events {
  'queue.push': (entry: LogEntry) => void;
  'queue.flush': (processId: string) => void;
  'queue.write': (url: string) => void;
}
