import type {
  LogEntry,
  PluginManager,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import {
  LogLevel,
  SmartMap,
  TaskAwareLogHandler,
  wrapPossiblePromise,
} from '@debugr/core';
import { AsyncLocalStorage } from 'async_hooks';
import { HtmlFileWriter } from './fileWriter';
import { HtmlRenderer } from './htmlRenderer';
import type { HtmlLogHandlerOptions, HtmlWriter, TaskData } from './types';
import { computeTaskHash } from './utils';

export class HtmlLogHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends TaskAwareLogHandler<TTaskContext, TGlobalContext> {
  public readonly threshold: LogLevel | number = 0;

  public readonly identifier: string = 'html';

  public readonly doesNeedFormatters: boolean = true;

  private renderer?: HtmlRenderer<TTaskContext, TGlobalContext>;

  private readonly writer: HtmlWriter;

  private readonly options: HtmlLogHandlerOptions;

  private readonly asyncStorage: AsyncLocalStorage<TaskData<TTaskContext, TGlobalContext>>;

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options: HtmlLogHandlerOptions,
  ): HtmlLogHandler<TTaskContext, TGlobalContext> {
    return new HtmlLogHandler<TTaskContext, TGlobalContext>(new HtmlFileWriter(options.outputDir), options);
  }

  public constructor(
    writer: HtmlWriter,
    options: HtmlLogHandlerOptions,
    renderer?: HtmlRenderer<TTaskContext, TGlobalContext>,
  ) {
    super();
    this.renderer = renderer;
    this.writer = writer;
    this.options = options;
    this.asyncStorage = new AsyncLocalStorage();
  }

  public injectPluginManager(pluginManager: PluginManager<TTaskContext, TGlobalContext>): void {
    if (!this.renderer) {
      this.renderer = HtmlRenderer.create(
        pluginManager,
        this.options.levelMap,
        this.options.colorMap,
      );
    }
  }

  public log(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): void {
    const task = this.asyncStorage.getStore();

    if (!task) {
      return;
    }

    task.log.entries.set(entry, task);
    task.lastTs = entry.ts;

    if (entry.level >= task.threshold && task.firstOverThreshold === undefined) {
      task.firstOverThreshold = entry;
    }
  }

  public runTask<R>(callback: () => R): R {
    const now = new Date();
    const parent = this.asyncStorage.getStore();

    const task: TaskData<TTaskContext, TGlobalContext> = {
      parent,
      index: parent ? parent.log.tasks++ : 0,
      log: parent
        ? parent.log
        : {
            entries: new SmartMap(),
            tasks: 1,
          },
      threshold: parent?.threshold ?? this.options.threshold ?? LogLevel.ERROR,
      ts: now,
      lastTs: now,
    };

    task.log.entries.set({ type: 'task:start', ts: now }, task);

    return wrapPossiblePromise(() => this.asyncStorage.run(task, callback), {
      finally: () => {
        task.log.entries.set({ type: 'task:end', ts: new Date() }, task);

        if (task.write === undefined) {
          task.write = !!task.firstOverThreshold;
        }

        if (task.parent && task.write && task.parent.write === undefined) {
          task.parent.write = true;
        }
      },
    });
  }

  public flush(): void {
    const task = this.asyncStorage.getStore();

    if (!task || task.parent) {
      return;
    }

    Promise.resolve().then(() => this.flushTask(task));
  }

  public setTaskThreshold(threshold: number): void {
    const task = this.asyncStorage.getStore();

    if (task) {
      task.threshold = threshold;
    }
  }

  public markTaskForWriting(force: boolean = false): void {
    this.markTask(true, force);
  }

  public markTaskIgnored(force: boolean = false): void {
    this.markTask(false, force);
  }

  private markTask(write: boolean, force: boolean = false) {
    const task = this.asyncStorage.getStore();

    if (task && (task.write === undefined || force)) {
      task.write = write;
    }
  }

  private async flushTask(task: TaskData<TTaskContext, TGlobalContext>): Promise<void> {
    if (!this.renderer) {
      throw new Error('Logger was incorrectly initialized, no renderer found');
    }

    if (task.log.id === undefined) {
      task.log.id = computeTaskHash(task);
    }

    if (task.write) {
      const content = this.renderer.renderTask(task);
      await this.writer.write(task.ts, task.log.id, content);
    }
  }
}
