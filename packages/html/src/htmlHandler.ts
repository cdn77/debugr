import type {
  LogEntry,
  Logger,
  PluginManager,
  ReadonlyRecursive,
  TaskAwareHandlerPlugin,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel, PluginKind, SmartMap, wrapPossiblePromise } from '@debugr/core';
import { AsyncLocalStorage } from 'async_hooks';
import { HtmlFileWriter } from './fileWriter';
import { HtmlRenderer } from './htmlRenderer';
import type { HtmlHandlerOptions, HtmlHandlerRequiredOptions, HtmlWriter, TaskData } from './types';
import { isHtmlWriter, isRequiredOptions } from './types';
import { computeTaskHash } from './utils';

export class HtmlHandler<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements TaskAwareHandlerPlugin<TTaskContext, TGlobalContext>
{
  public readonly id = 'html';
  public readonly kind = PluginKind.Handler;

  private readonly writer: HtmlWriter;
  private readonly options: HtmlHandlerOptions;
  private renderer?: HtmlRenderer<TTaskContext, TGlobalContext>;
  private readonly asyncStorage: AsyncLocalStorage<TaskData<TTaskContext, TGlobalContext>>;

  public constructor(
    options: HtmlHandlerRequiredOptions,
    renderer?: HtmlRenderer<TTaskContext, TGlobalContext>,
  );
  public constructor(writer: HtmlWriter, renderer?: HtmlRenderer<TTaskContext, TGlobalContext>);
  public constructor(
    writer: HtmlWriter,
    options?: HtmlHandlerOptions,
    renderer?: HtmlRenderer<TTaskContext, TGlobalContext>,
  );
  public constructor(
    writerOrOptions: HtmlHandlerRequiredOptions | HtmlWriter,
    optionsOrRenderer?: HtmlHandlerOptions | HtmlRenderer<TTaskContext, TGlobalContext>,
    maybeRenderer?: HtmlRenderer<TTaskContext, TGlobalContext>,
  ) {
    if (isHtmlWriter(writerOrOptions)) {
      this.writer = writerOrOptions;

      if (optionsOrRenderer instanceof HtmlRenderer) {
        this.renderer = optionsOrRenderer;
        this.options = {};
      } else {
        this.renderer = maybeRenderer;
        this.options = optionsOrRenderer ?? {};
      }
    } else if (isRequiredOptions(writerOrOptions)) {
      const { outputDir, ...options } = writerOrOptions;
      this.writer = new HtmlFileWriter(outputDir);
      this.renderer = optionsOrRenderer instanceof HtmlRenderer ? optionsOrRenderer : undefined;
      this.options = options;
    } else {
      throw new Error(`Either the 'outputDir' option or the 'writer' argument is required`);
    }

    this.asyncStorage = new AsyncLocalStorage();
  }

  public injectLogger(
    logger: Logger<TTaskContext, TGlobalContext>,
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
  ): void {
    if (!this.renderer) {
      this.renderer = new HtmlRenderer(pluginManager, this.options.levelMap, this.options.colorMap);
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

        if (task.write) {
          if (!task.parent) {
            Promise.resolve().then(() => this.writeDumpFile(task));
          } else if (task.parent.write === undefined) {
            task.parent.write = true;
          }
        }
      },
    });
  }

  public setTaskThreshold(threshold: LogLevel): void {
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

  private async writeDumpFile(task: TaskData<TTaskContext, TGlobalContext>): Promise<void> {
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
