import type {
  EntryType,
  ImmutableDate,
  LogEntry,
  MappedRecord,
  PluginManager,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { levelToValue, LogLevel, normalizeMap, resolveFormatters } from '@debugr/core';
import { blue, dim, unstyle } from 'ansi-colors';
import type { ConsoleFormatterPlugin } from './formatters';
import { DefaultConsoleFormatter, isConsoleFormatter } from './formatters';
import type { ConsoleColor } from './maps';
import { defaultColorMap, defaultFormatters, defaultLevelMap } from './maps';

const ts0 = new Date();

export class ConsoleFormatter<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
> {
  private readonly timestamp: boolean | ((ts: ImmutableDate) => string);
  private readonly levelMap: Map<LogLevel, string>;
  private readonly colorMap: Map<LogLevel, ConsoleColor>;
  private readonly formatters: MappedRecord<
    EntryType,
    ConsoleFormatterPlugin<TTaskContext, TGlobalContext>
  >;
  private readonly defaultFormatter: DefaultConsoleFormatter<TTaskContext, TGlobalContext>;

  public constructor(
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
    levelMap: MappedRecord<LogLevel, string> = {},
    colorMap: MappedRecord<LogLevel, ConsoleColor> = {},
    timestamp: boolean | ((ts: ImmutableDate) => string) = true,
  ) {
    this.levelMap = normalizeMap({ ...defaultLevelMap, ...levelMap });
    this.colorMap = normalizeMap({ ...defaultColorMap, ...colorMap });
    this.timestamp = timestamp;
    this.formatters = resolveFormatters(pluginManager, isConsoleFormatter, defaultFormatters);
    this.defaultFormatter = new DefaultConsoleFormatter();
  }

  public format(entry: LogEntry<TTaskContext, TGlobalContext>): string {
    return [...this.tryFormatEntry(entry)].join('\n');
  }

  protected formatError(e: Error): string {
    return this.formatLines(LogLevel.INTERNAL, this.defaultFormatter.formatError(e));
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
      (!noPlugin && entry.type && this.formatters[entry.type]) || this.defaultFormatter;
    return this.formatLines(entry.level, formatter.formatEntry(entry), entry.ts);
  }

  protected formatLines(level: LogLevel, content: string, ts?: ImmutableDate): string {
    const color = levelToValue(this.colorMap, level, blue);
    const lvl = levelToValue(this.levelMap, level, '??');
    const prefix = `${this.formatTimestamp(ts)}[${color(lvl)}] `;
    const indent = unstyle(prefix).replace(/./g, ' ');
    return `${prefix}${content.split(/\n/g).join(`\n${indent}`)}`;
  }

  protected formatTimestamp(ts?: ImmutableDate): string {
    if (this.timestamp === false) {
      return '';
    }

    const formatted =
      typeof this.timestamp === 'function' ? this.timestamp(ts ?? ts0) : (ts ?? ts0).toISOString();

    return dim(ts ? formatted : formatted.replace(/[^-]/g, '-'));
  }
}
