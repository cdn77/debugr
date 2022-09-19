import { LogLevel } from '@debugr/core';
import { blue, dim, magenta, red, yellow } from 'ansi-colors';
import type { ConsoleFormatterPlugin } from './formatters';
import {
  GraphQLQueryConsoleFormatter,
  HttpRequestConsoleFormatter,
  HttpResponseConsoleFormatter,
  SqlQueryConsoleFormatter,
} from './formatters';

export const defaultLevelMap: Record<number, string> = {
  [LogLevel.TRACE]: 'cc',
  [LogLevel.DEBUG]: 'dd',
  [LogLevel.INFO]: 'ii',
  [LogLevel.WARNING]: 'WW',
  [LogLevel.ERROR]: 'EE',
  [LogLevel.FATAL]: 'FF',
  [-1]: 'ii',
  0: '??',
};

export type ConsoleColor = (value: string) => string;

export const defaultColorMap: Record<number, ConsoleColor> = {
  [LogLevel.TRACE]: dim,
  [LogLevel.DEBUG]: dim,
  [LogLevel.INFO]: (value) => value,
  [LogLevel.WARNING]: yellow,
  [LogLevel.ERROR]: red,
  [LogLevel.FATAL]: red,
  [-1]: magenta,
  0: blue,
};

export const defaultFormatters: Record<string, () => ConsoleFormatterPlugin> = {
  'graphql.query': () => new GraphQLQueryConsoleFormatter(),
  'http.request': () => new HttpRequestConsoleFormatter(),
  'http.response': () => new HttpResponseConsoleFormatter(),
  'sql.query': () => new SqlQueryConsoleFormatter(),
};
