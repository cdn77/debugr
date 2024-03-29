import type {
  ImmutableDate,
  LogEntry,
  LogLevel,
  MappedRecord,
  ReadonlyRecursive,
  SmartMap,
  TContextBase,
  TContextShape,
} from '@debugr/core';

export type HtmlHandlerOptions = {
  threshold?: LogLevel;
  levelMap?: MappedRecord<LogLevel, string>;
  colorMap?: MappedRecord<LogLevel, string>;
};

export type HtmlHandlerRequiredOptions = HtmlHandlerOptions & {
  outputDir: string;
};

export function isRequiredOptions(
  options: HtmlHandlerOptions,
): options is HtmlHandlerRequiredOptions {
  return typeof (options as any).outputDir === 'string';
}

export type TaskBoundary = {
  type: 'task:start' | 'task:end';
  ts: ImmutableDate;
};

export function isTaskBoundary(value: any): value is TaskBoundary {
  return value.type === 'task:start' || value.type === 'task:end';
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
};

export type TaskLogInfo = {
  maxParallelTasks: number;
  usedLevels: LogLevel[];
};

export type TaskData<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = {
  index: number;
  parent?: TaskData<TTaskContext, TGlobalContext>;
  log: TaskLog<TTaskContext, TGlobalContext>;
  threshold: number;
  firstOverThreshold?: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>;
  write?: boolean;
  ts: ImmutableDate;
  lastTs: ImmutableDate;
};

export interface HtmlWriter {
  write(ts: ImmutableDate, id: string, content: string): Promise<string> | string;
}

export function isHtmlWriter(value: any): value is HtmlWriter {
  return value && typeof value === 'object' && typeof value.write === 'function';
}
