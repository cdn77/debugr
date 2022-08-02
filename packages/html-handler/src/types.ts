import {
  ImmutableDate,
  LogEntry,
  LogLevel,
  ReadonlyRecursive,
  SmartMap,
  TContextBase,
  TContextShape,
} from '@debugr/core';

export type HtmlLogHandlerOptions = {
  threshold?: LogLevel | number;
  cloneData?: boolean;
  outputDir: string;
  levelMap?: Record<number, string>;
  colorMap?: Record<number, string>;
};

export type TaskBoundary = {
  type: 'task:start' | 'task:end';
  ts: ImmutableDate;
};

export function isTaskBoundary(value: any): value is TaskBoundary {
  return (value as any).type === 'task:start' || (value as any).type === 'task:end';
}

export type TaskLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>> | TaskBoundary;

export type TaskLog<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = {
  id?: string;
  entries: SmartMap<
    TaskLogEntry<TTaskContext, TGlobalContext>,
    TaskData<TTaskContext, TGlobalContext>
  >;
  tasks: number;
  write?: boolean;
};

export type TaskLogInfo = {
  maxParallelTasks: number;
  usedLevels: number[];
};

export type TaskData<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = {
  index: number;
  parent?: number;
  log: TaskLog<TTaskContext, TGlobalContext>;
  threshold?: number;
  firstOverThreshold?: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>;
  ts: ImmutableDate;
  lastTs: ImmutableDate;
};

export interface HtmlWriter {
  write(ts: ImmutableDate, id: string, content: string): Promise<string> | string;
}
