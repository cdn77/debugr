import { LogEntry, ImmutableDate, TContextBase } from '@debugr/core';

export type GcOptions = {
  interval?: number;
  threshold?: number;
};

export type FullGcOptions = Readonly<Required<GcOptions>>;

export type HtmlLogHandlerOptions = {
  threshold: number;
  cloneData: boolean;
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
