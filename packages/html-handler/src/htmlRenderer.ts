import type {
  ImmutableDate,
  LogEntry,
  PluginManager,
  ReadonlyRecursive,
  SmartMap,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { normalizeMap } from '@debugr/core';
import type { HtmlFormatterPlugin } from './formatters';
import { DefaultHtmlFormatter } from './formatters';
import {
  defaultColorMap,
  defaultLevelMap,
  EntryTemplate,
  LayoutTemplate,
  TaskRenderer,
} from './templates';
import type { TaskBoundary, TaskData, TaskLogEntry } from './types';
import { isTaskBoundary } from './types';
import { findDefiningEntry, getFormatters, getTaskLogInfo } from './utils';

export class HtmlRenderer<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  private readonly layout: LayoutTemplate;

  private readonly entry: EntryTemplate;

  private readonly formatters: Record<string, HtmlFormatterPlugin<TTaskContext, TGlobalContext>>;

  private readonly defaultFormatter: DefaultHtmlFormatter<TTaskContext, TGlobalContext>;

  public static create<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
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

    this.layout = new LayoutTemplate(levels, colors);
    this.entry = new EntryTemplate(levels);
    this.formatters = getFormatters(pluginManager);
    this.defaultFormatter = new DefaultHtmlFormatter(levels);
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
        const prev = previous.get(entry.type === 'task:start' ? task.parent?.index ?? -1 : task.index);
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
    if (entry.format) {
      try {
        return this.formatters[entry.format].getEntryTitle(entry);
      } catch (e) {
        /* noop */
      }
    }

    return this.defaultFormatter.getEntryTitle(entry);
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
        ? renderer.renderTaskStart(task.index, task.parent?.index)
        : renderer.renderTaskEnd(task.index, task.parent?.index);

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
      !noPlugin && entry.format ? this.formatters[entry.format] : this.defaultFormatter;

    return this.entry.render(
      this.entry.formatTimestamp(entry.ts, previousTs),
      entry.level,
      plugin.renderEntry(entry),
      plugin.getEntryLabel && plugin.getEntryLabel(entry),
      task.index,
      entry === task.firstOverThreshold,
      taskRenderer?.renderTaskStates(task.index),
    );
  }

  protected renderError(error: Error, task?: number, taskRenderer?: TaskRenderer): string {
    return this.entry.render(
      '',
      -1,
      this.defaultFormatter.renderError(error, false),
      undefined,
      task,
      false,
      taskRenderer?.renderTaskStates(task),
    );
  }
}
