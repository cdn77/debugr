import { PluginId } from '../plugins';

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

export type LogEntry = {
  plugin?: PluginId;
  level: number;
  message?: string;
  data?: Record<string, any>;
  ts: number;
};

export type LogEntryQueue = {
  id?: string;
  entries: LogEntry[];
  write?: boolean;
  firstOverThreshold?: number;
  ts: number;
  lastTs: number;
};
