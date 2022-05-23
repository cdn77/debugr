import { LogEntry, ImmutableDate, TContextBase, LogLevel, TContextShape } from '@debugr/core';

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
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> = {
  id?: string;
  entries: LogEntry<Partial<TTaskContext>, TGlobalContext>[];
  write?: boolean;
  threshold?: number;
  firstOverThreshold?: number;
  ts: ImmutableDate;
  lastTs: ImmutableDate;
};
