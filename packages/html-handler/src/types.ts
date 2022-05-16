import { LogEntry, ImmutableDate, TContextBase, LogLevel } from '@debugr/core';

export type GcOptions = {
  interval?: number;
  threshold?: LogLevel | number;
};

export type FullGcOptions = Readonly<Required<GcOptions>>;

export type HtmlLogHandlerOptions = {
  threshold: LogLevel | number;
  cloneData?: boolean;
  outputDir: string;
  gc: FullGcOptions;
};

export type LogEntryQueue<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> = {
  id?: string;
  entries: LogEntry<Partial<TContext>, TGlobalContext>[];
  write?: boolean;
  threshold?: number;
  firstOverThreshold?: number;
  ts: ImmutableDate;
  lastTs: ImmutableDate;
};
