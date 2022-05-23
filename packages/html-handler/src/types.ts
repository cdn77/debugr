import { LogEntry, ImmutableDate, TContextBase, LogLevel, TContextShape } from '@debugr/core';

export type HtmlLogHandlerOptions = {
  threshold: LogLevel | number;
  cloneData?: boolean;
  outputDir: string;
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
