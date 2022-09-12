import type {
  LogEntry,
  ReadonlyRecursive,
  SmartMap,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel } from '@debugr/core';
import { createHash } from 'crypto';
import type { TaskData, TaskLogEntry, TaskLogInfo } from './types';
import { isTaskBoundary } from './types';

export function getTaskLogInfo(entries: SmartMap<TaskLogEntry, TaskData>): TaskLogInfo {
  const tasks: number[] = [];
  const levels: Set<number> = new Set();
  let max: number = 0;

  for (const [entry, task] of entries) {
    if (!isTaskBoundary(entry)) {
      levels.add(entry.level);
      continue;
    }

    const idx = tasks.indexOf(task.index);

    if (entry.type === 'task:start' && idx < 0) {
      tasks.push(task.index);
      max = Math.max(max, tasks.length);
    } else if (entry.type === 'task:end' && idx > -1) {
      tasks[idx] = -1;

      for (let i = tasks.length - 1; i >= 0 && tasks[i] < 0; --i) {
        tasks.pop();
      }
    }
  }

  return {
    maxParallelTasks: max,
    usedLevels: [...levels.values()],
  };
}

export function findDefiningEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>(
  task: TaskData<TTaskContext, TGlobalContext>,
): ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>> {
  if (task.firstOverThreshold) {
    return task.firstOverThreshold;
  } else if (!task.log.entries.size) {
    return {
      ts: task.ts,
      level: LogLevel.WARNING,
      taskContext: {} as any,
      globalContext: {} as any,
      message: 'EMPTY QUEUE!',
    };
  }

  return task.log.entries
    .filter((v) => !isTaskBoundary(v))
    .reduceKeys((a: any, b: any) => (b.level > a.level ? b : a)) as any;
}

export function computeTaskHash<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>(task: TaskData<TTaskContext, TGlobalContext>): string {
  const entry = findDefiningEntry(task);
  const key = JSON.stringify([entry.level, entry.message, entry.data]);
  const sha1 = createHash('sha1');
  sha1.update(key);
  return sha1.digest('hex').substring(0, 16);
}
