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
import * as styles from './consoleStyle';
import type { ConsoleFormatterPlugin } from './formatters';
import { DefaultConsoleFormatter, isConsoleFormatter } from './formatters';
import { defaultColorMap, defaultFormatters, defaultLevelMap } from './maps';
import type { ConsoleColor, ConsoleStyle, ConsoleStyleName } from './types';

const ts0 = new Date();

export class ConsoleFormatter<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
> {
  private readonly style: ConsoleStyle;
  private readonly levelMap: Map<LogLevel, string>;
  private readonly colorMap: Map<LogLevel, ConsoleColor>;
  private readonly formatTimestamp: (ts?: ImmutableDate) => string;
  private readonly formatters: MappedRecord<
    EntryType,
    ConsoleFormatterPlugin<TTaskContext, TGlobalContext>
  >;
  private readonly defaultFormatter: DefaultConsoleFormatter<TTaskContext, TGlobalContext>;

  public constructor(
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
    levelMap: MappedRecord<LogLevel, string> = {},
    colorMap: MappedRecord<LogLevel, ConsoleColor | ConsoleStyleName> = {},
    colors: boolean = true,
    timestamp: boolean | ((ts: ImmutableDate) => string) = true,
  ) {
    this.style = colors ? styles.ansi : styles.none;
    this.levelMap = normalizeMap({ ...defaultLevelMap, ...levelMap });
    this.colorMap = normalizeColorMap(this.style, { ...defaultColorMap, ...colorMap });
    this.formatTimestamp = createTimestampFormatter(this.style, timestamp);
    this.formatters = resolveFormatters(pluginManager, isConsoleFormatter, defaultFormatters);
    this.defaultFormatter = new DefaultConsoleFormatter();
  }

  public format(entry: LogEntry<TTaskContext, TGlobalContext>): string {
    return [...this.tryFormatEntry(entry)].join('\n');
  }

  protected formatError(e: Error): string {
    return this.formatLines(LogLevel.INTERNAL, this.defaultFormatter.formatError(e, this.style));
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
    return this.formatLines(entry.level, formatter.formatEntry(entry, this.style), entry.ts);
  }

  protected formatLines(level: LogLevel, content: string, ts?: ImmutableDate): string {
    const color = levelToValue(this.colorMap, level, this.style.blue);
    const lvl = levelToValue(this.levelMap, level, '??');
    const prefix = `${this.formatTimestamp(ts)}[${color(lvl)}] `;
    const indent = this.style.unstyle(prefix).replace(/./g, ' ');
    return `${prefix}${content.split(/\n/g).join(`\n${indent}`)}`;
  }
}

function normalizeColorMap(
  style: ConsoleStyle,
  map: MappedRecord<LogLevel, ConsoleColor | ConsoleStyleName>,
): Map<LogLevel, ConsoleColor> {
  for (const level of Object.keys(map)) {
    if (typeof map[level] === 'string') {
      map[level] = style[map[level]];
    }
  }

  return normalizeMap(map as MappedRecord<LogLevel, ConsoleColor>);
}

function createTimestampFormatter(
  style: ConsoleStyle,
  timestamp: ((ts: ImmutableDate) => string) | boolean,
): (ts?: ImmutableDate) => string {
  if (timestamp === false) {
    return () => '';
  }

  const format =
    typeof timestamp === 'function' ? timestamp : (ts: ImmutableDate) => ts.toISOString();

  return (ts) => {
    const formatted = format(ts ?? ts0);
    const styled = style.dim(ts ? formatted : formatted.replace(/[^-]/g, '-'));
    return `${styled} `;
  };
}
