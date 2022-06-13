import {
  LogEntry,
  ImmutableDate,
  TContextBase,
  LogLevel,
  TContextShape,
  ReadonlyRecursive,
} from '@debugr/core';

export type HtmlLogHandlerOptions = {
  threshold: LogLevel | number;
  cloneData?: boolean;
  outputDir: string;
};

export type LogEntryQueue<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> = {
  id?: string;
  entries: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>>[];
  write?: boolean;
  threshold?: number;
  firstOverThreshold?: number;
  ts: ImmutableDate;
  lastTs: ImmutableDate;
};
