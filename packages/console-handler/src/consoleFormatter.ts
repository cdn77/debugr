import { dim, gray, yellow, red, white, blue, unstyle } from 'ansi-colors';
import {
  FormatterPlugin,
  PluginManager,
  LogEntry,
  Formatter,
  formatData,
  isEmpty,
  TContextBase,
  TContextShape,
} from '@debugr/core';

export class ConsoleFormatter<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
> extends Formatter<Partial<TTaskContext>, TGlobalContext> {
  private readonly writeTimestamp: boolean;

  constructor(
    pluginManager: PluginManager<Partial<TTaskContext>, TGlobalContext>,
    writeTimestamp: boolean = true,
  ) {
    super(pluginManager);
    this.writeTimestamp = writeTimestamp;
  }

  protected formatEntry(
    entry: LogEntry<Partial<TTaskContext>, TGlobalContext>,
    _previousTs?: Date,
    plugin?: FormatterPlugin,
  ): string {
    return formatEntry(
      this.levelMap[entry.level] || 'unknown',
      plugin ? plugin.formatEntry(entry) : formatDefaultContent(entry.message, entry.data),
      plugin && plugin.getEntryLabel(entry),
      this.writeTimestamp ? entry.ts.getTime() : false,
    );
  }

  protected formatError(e: Error, message: string): string {
    return formatEntry(
      'internal',
      formatDefaultContent(`${message} ${e.message}`, { stack: e.stack }),
      undefined,
      this.writeTimestamp ? undefined : false,
    );
  }
}

const colorMap: Record<string, (str: string) => string> = {
  internal: blue,
  debug: gray,
  info: white,
  warning: yellow,
  error: red,
};

function formatEntry(level: string, content: string, label?: string, ts?: number | false): string {
  const levelColor = colorMap[level] || ((s: string) => s);
  const prefix = `${formatDate(ts)}${levelColor(level)} `;
  const indent = new Array(unstyle(prefix).length + 1).join(' ');
  const lines = content.split(/\n/g);

  if (label) {
    lines.unshift(label);
  }

  return `${prefix}${lines.join(`\n${indent}`)}`;
}

function formatDate(ts?: number | false): string {
  if (ts === false) {
    return '';
  }

  return `${dim(ts ? `[${new Date(ts).toISOString()}]` : '[------------------------]')} `;
}

function formatDefaultContent(message?: string, data?: Record<string, any>): string {
  const { stack, ...otherData } = data || {};
  const parts: string[] = [];

  if (message) {
    parts.push(message);
  }

  if (!isEmpty(otherData)) {
    parts.push('Data:', dim(formatData(otherData)));
  }

  if (stack) {
    parts.push('Stack trace:', dim(stack));
  }

  return parts.join('\n');
}
