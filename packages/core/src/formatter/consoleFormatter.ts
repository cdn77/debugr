import { dim, gray, yellow, red, white, blue } from 'chalk';
import { FormatterPlugin } from '../plugins';
import { LogEntry } from '../queues';
import { Formatter } from './formatter';
import { formatData } from './utils';

export class ConsoleFormatter extends Formatter {
  protected formatEntry(entry: LogEntry, previousTs?: number, plugin?: FormatterPlugin): string {
    return formatEntry(
      this.levelMap[entry.level] || 'unknown',
      plugin ? plugin.formatConsoleEntry(entry) : formatDefaultContent(entry.message, entry.data),
      plugin && plugin.getEntryLabel(entry),
      entry.ts,
    );
  }

  protected formatError(e: Error, message: string): string {
    return formatEntry(
      'internal',
      formatDefaultContent(`${message} ${e.message}`, { stack: e.stack }),
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

function formatEntry(level: string, content: string, label?: string, ts?: number): string {
  const date = ts ? `[${new Date(ts).toISOString()}]` : '[------------------------]';
  const levelColor = colorMap[level] || ((s: string) => s);
  const prefix = `${dim(date)} ${levelColor(level)} `;
  const indent = new Array(prefix.length + 1).join(' ');
  const lines = content.split(/\n/g);

  if (label) {
    lines.unshift(label);
  }

  return `${prefix}${lines.join(`\n${indent}`)}`;
}

function formatDefaultContent(message?: string, data?: Record<string, any>): string {
  const { stack, ...otherData } = data || {};
  const parts: string[] = [];

  if (message) {
    parts.push(message);
  }

  if (otherData) {
    parts.push('Data:', formatData(otherData));
  }

  if (stack) {
    parts.push('Stack trace:', stack);
  }

  return parts.join('\n');
}
