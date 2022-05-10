import { LogEntry, ImmutableDate } from '@debugr/core';

export type GcOptions = {
  interval?: number;
  threshold?: number;
};

export type FullGcOptions = Readonly<Required<GcOptions>>;

export type QueueManagerOptions = {
  threshold: number;
  cloneData: boolean;
  gc: FullGcOptions;
};

export type LogEntryQueue = {
  id?: string;
  entries: LogEntry[];
  write?: boolean;
  threshold?: number;
  firstOverThreshold?: number;
  ts: ImmutableDate;
  lastTs: ImmutableDate;
};
