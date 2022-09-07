import type {
  ImmutableDate,
  LogEntry,
  PluginManager,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import {
  levelToValue,
  normalizeMap,
  resolveFormatters,
} from '@debugr/core';
import { dim, unstyle } from 'ansi-colors';
import type { ConsoleFormatterPlugin } from './formatters';
import { DefaultConsoleFormatter, isConsoleFormatter } from './formatters';
import type { ConsoleColor } from './maps';
import { defaultColorMap, defaultFormatters,defaultLevelMap } from './maps';

export class ConsoleFormatter<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
> {
  private readonly writeTimestamp: boolean;

  private readonly levelMap: Map<number, string>;

  private readonly colorMap: Map<number, ConsoleColor>;

  private readonly formatters: Record<string, ConsoleFormatterPlugin<TTaskContext, TGlobalContext>>;

  private readonly defaultFormatter: DefaultConsoleFormatter<TTaskContext, TGlobalContext>;

  constructor(
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
    levelMap: Record<number, string> = {},
    colorMap: Record<number, ConsoleColor> = {},
    writeTimestamp: boolean = true,
  ) {
    this.levelMap = normalizeMap({ ...defaultLevelMap, ...levelMap });
    this.colorMap = normalizeMap({ ...defaultColorMap, ...colorMap });
    this.writeTimestamp = writeTimestamp;
    this.formatters = resolveFormatters(pluginManager, isConsoleFormatter, defaultFormatters);
    this.defaultFormatter = new DefaultConsoleFormatter();
  }

  public format(entry: LogEntry<TTaskContext, TGlobalContext>): string {
    return [...this.tryFormatEntry(entry)].join('\n');
  }

  protected formatError(e: Error): string {
    return this.formatLines(-1, this.defaultFormatter.formatError(e));
  }

  protected *tryFormatEntry(entry: LogEntry<TTaskContext, TGlobalContext>): Generator<string> {
    try {
      yield this.formatEntry(entry);
    } catch (e) {
      try {
        const content = this.formatEntry(entry, true);
        yield this.formatError(e);
        yield content;
      } catch (e2) {
        yield this.formatError(e);
      }
    }
  }

  protected formatEntry(
    entry: LogEntry<TTaskContext, TGlobalContext>,
    noPlugin: boolean = false,
  ): string {
    const formatter =
      !noPlugin && entry.type ? this.formatters[entry.type] : this.defaultFormatter;

    return this.formatLines(entry.level, formatter.formatEntry(entry), entry.ts);
  }

  protected formatLines(level: number, content: string, ts?: ImmutableDate): string {
    const color = levelToValue(this.colorMap, level);
    const lvl = levelToValue(this.levelMap, level);
    const prefix = `${formatDate(this.writeTimestamp && ts)}[${color(lvl)}] `;
    const indent = unstyle(prefix).replace(/./g, ' ');
    return `${prefix}${content.split(/\n/g).join(`\n${indent}`)}`;
  }
}

function formatDate(ts?: ImmutableDate | false): string {
  if (ts === false) {
    return '';
  }

  return `${dim(ts ? ts.toISOString() : '------------------------')} `;
}
