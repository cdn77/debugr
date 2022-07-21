import {
  LogEntry,
  LogLevel,
  PluginManager,
  ReadonlyRecursive,
  SmartMap,
  TaskAwareLogHandler,
  TContextBase,
  TContextShape,
  wrapPossiblePromise,
} from '@debugr/core';
import { AsyncLocalStorage } from 'async_hooks';
import { HtmlRenderer } from './htmlRenderer';
import { HtmlLogHandlerOptions, TaskData } from './types';
import { computeTaskHash } from './utils';
import { Writer } from './writer';

export class HtmlLogHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends TaskAwareLogHandler<TTaskContext, TGlobalContext> {
  public readonly threshold: LogLevel | number = 0;

  public readonly identifier: string = 'html';

  public readonly doesNeedFormatters: boolean = true;

  private renderer?: HtmlRenderer<TTaskContext, TGlobalContext>;

  private readonly writer: Writer;

  private readonly options: HtmlLogHandlerOptions;

  private readonly asyncStorage: AsyncLocalStorage<TaskData<TTaskContext, TGlobalContext>>;

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options: HtmlLogHandlerOptions,
  ): HtmlLogHandler<TTaskContext, TGlobalContext> {
    return new HtmlLogHandler<TTaskContext, TGlobalContext>(new Writer(options.outputDir), options);
  }

  public constructor(
    writer: Writer,
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

    const threshold = task.threshold ?? this.options.threshold ?? LogLevel.ERROR;

    if (entry.level >= threshold && task.firstOverThreshold === undefined) {
      task.firstOverThreshold = entry;
    }
  }

  public runTask<R>(callback: () => R): R {
    const now = new Date();
    const parent = this.asyncStorage.getStore();

    const task: TaskData<TTaskContext, TGlobalContext> = {
      parent: parent?.index,
      index: parent ? parent.log.tasks++ : 0,
      log: parent
        ? parent.log
        : {
            entries: new SmartMap(),
            tasks: 1,
          },
      threshold: parent?.threshold,
      ts: now,
      lastTs: now,
    };

    task.log.entries.set({ type: 'task:start', ts: now }, task);

    return wrapPossiblePromise(() => this.asyncStorage.run(task, callback), {
      finally: () => task.log.entries.set({ type: 'task:end', ts: new Date() }, task),
    });
  }

  public flush(): void {
    const task = this.asyncStorage.getStore();

    if (!task || task.parent !== undefined) {
      return;
    }

    Promise.resolve().then(() => this.flushTask(task));
  }

  private async flushTask(task: TaskData<TTaskContext, TGlobalContext>): Promise<void> {
    if (!this.renderer) {
      throw new Error('Logger was incorrectly initialized, no renderer found');
    }

    if (task.log.id === undefined) {
      task.log.id = computeTaskHash(task);
    }

    if (task.log.write === undefined) {
      task.log.write = task.firstOverThreshold !== undefined;
    }

    if (task.log.write) {
      const content = this.renderer.renderTask(task);
      await this.writer.write(task.ts, task.log.id, content);
    }
  }
}
