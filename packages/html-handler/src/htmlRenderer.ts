import {
  isFormatterPlugin,
  LogEntry,
  ImmutableDate,
  TContextBase,
  TContextShape,
  ReadonlyRecursive,
  PluginManager,
  SmartMap,
} from '@debugr/core';
import {
  LayoutTemplate,
  EntryTemplate,
  TaskRenderer,
  defaultColorMap,
  defaultLevelMap,
} from './templates';
import { isTaskBoundary, TaskBoundary, TaskData, TaskLogEntry } from './types';
import { normalizeMap, levelToValue, findDefiningEntry, getTaskLogInfo } from './utils';

export class HtmlRenderer<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  private readonly pluginManager: PluginManager<TTaskContext, TGlobalContext>;

  private readonly layout: LayoutTemplate;

  private readonly entry: EntryTemplate;

  private readonly levelMap: Map<number, string>;

  public static create<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  >(
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
    levelMap?: Record<number, string>,
    colorMap?: Record<number, string>,
  ): HtmlRenderer<TTaskContext, TGlobalContext> {
    return new HtmlRenderer(pluginManager, levelMap, colorMap);
  }

  constructor(
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
    levelMap: Record<number, string> = {},
    colorMap: Record<number, string> = {},
  ) {
    const levels = normalizeMap({ ...defaultLevelMap, ...levelMap });
    const colors = normalizeMap({ ...defaultColorMap, ...colorMap });

    this.pluginManager = pluginManager;
    this.layout = new LayoutTemplate(levels, colors);
    this.entry = new EntryTemplate(levels);
    this.levelMap = levels;
  }

  renderTask(task: TaskData<TTaskContext, TGlobalContext>): string {
    const definingEntry = findDefiningEntry(task);
    const { maxParallelTasks, usedLevels } = getTaskLogInfo(task.log.entries);
    const taskRenderer = maxParallelTasks > 1 ? new TaskRenderer() : undefined;

    return this.layout.render(
      definingEntry.level,
      this.getEntryTitle(definingEntry),
      usedLevels,
      task.log.tasks,
      maxParallelTasks,
      this.renderContent(task.log.entries, taskRenderer),
    );
  }

  protected renderContent(
    entries: SmartMap<
      TaskLogEntry<TTaskContext, TGlobalContext>,
      TaskData<TTaskContext, TGlobalContext>
    >,
    taskRenderer?: TaskRenderer,
  ): string {
    const chunks: string[] = [];
    const previous: Map<number, ImmutableDate> = new Map();

    for (const [entry, task] of entries) {
      if (isTaskBoundary(entry)) {
        const prev = previous.get(entry.type === 'task:start' ? task.parent ?? -1 : task.index);
        const boundary = this.renderTaskBoundary(entry, task, taskRenderer, prev);
        boundary && chunks.push(boundary);
      } else {
        chunks.push(...this.tryRenderEntry(task, entry, taskRenderer, previous.get(task.index)));
      }

      previous.set(task.index, entry.ts);
    }

    return chunks.join('\n        ');
  }

  protected getEntryTitle(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): string {
    const plugin = entry.format ? this.pluginManager.get(entry.format) : undefined;

    if (plugin && isFormatterPlugin(plugin)) {
      return plugin.getEntryTitle(entry);
    }

    if (entry.message) {
      return entry.message;
    }

    if (entry.error && entry.error.message) {
      return entry.error.message;
    }

    return `Unknown ${levelToValue(this.levelMap, entry.level, 'entry')}`;
  }

  protected renderTaskBoundary(
    boundary: TaskBoundary,
    task: TaskData<TTaskContext, TGlobalContext>,
    renderer?: TaskRenderer,
    previousTs?: ImmutableDate,
  ): string | undefined {
    if (!renderer) {
      return undefined;
    }

    const content =
      boundary.type === 'task:start'
        ? renderer.renderTaskStart(task.index, task.parent)
        : renderer.renderTaskEnd(task.index, task.parent);

    if (!content) {
      return undefined;
    }

    return this.entry.renderMeta(
      this.entry.formatTimestamp(boundary.ts, previousTs),
      content,
      task.index,
    );
  }

  protected *tryRenderEntry(
    task: TaskData,
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
    taskRenderer?: TaskRenderer,
    previousTs?: ImmutableDate,
  ): Generator<string> {
    try {
      yield this.renderEntry(task, entry, previousTs, taskRenderer);
    } catch (e) {
      try {
        const content = this.renderEntry(task, entry, previousTs, taskRenderer, true);
        yield this.renderError(e, task.index, taskRenderer);
        yield content;
      } catch (e2) {
        yield this.renderError(e, task.index, taskRenderer);
      }
    }
  }

  protected renderEntry(
    task: TaskData,
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
    previousTs?: ImmutableDate,
    taskRenderer?: TaskRenderer,
    noPlugin: boolean = false,
  ): string {
    const plugin =
      !noPlugin && entry.format ? this.pluginManager.get(`${entry.format}-html`) : undefined;

    if (plugin && !isFormatterPlugin(plugin)) {
      throw new Error(`Invalid plugin: ${entry.format} is not a Formatter plugin`);
    }

    return this.entry.render(
      this.entry.formatTimestamp(entry.ts, previousTs),
      entry.level,
      plugin ? plugin.getEntryLabel(entry) : '',
      plugin ? plugin.formatEntry(entry) : this.entry.renderDefaultContent(entry),
      task.index,
      entry === task.firstOverThreshold,
      taskRenderer?.renderTaskStates(task.index),
    );
  }

  protected renderError(error: Error, task?: number, taskRenderer?: TaskRenderer): string {
    return this.entry.render(
      '',
      -1,
      '',
      this.entry.renderDefaultContent({ error }),
      task,
      false,
      taskRenderer?.renderTaskStates(task),
    );
  }
}
