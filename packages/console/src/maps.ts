import type { MappedRecord } from '@debugr/core';
import { EntryType, LogLevel } from '@debugr/core';
import { dim, magenta, red, yellow } from 'ansi-colors';
import type { ConsoleFormatterPlugin } from './formatters';
import {
  GraphqlQueryConsoleFormatter,
  HttpRequestConsoleFormatter,
  HttpResponseConsoleFormatter,
  SqlQueryConsoleFormatter,
} from './formatters';

export const defaultLevelMap: MappedRecord<LogLevel, string> = {
  [LogLevel.TRACE]: 'cc',
  [LogLevel.DEBUG]: 'dd',
  [LogLevel.INFO]: 'ii',
  [LogLevel.WARNING]: 'WW',
  [LogLevel.ERROR]: 'EE',
  [LogLevel.FATAL]: 'FF',
  [LogLevel.INTERNAL]: 'ii',
};

export type ConsoleColor = (value: string) => string;

export const defaultColorMap: MappedRecord<LogLevel, ConsoleColor> = {
  [LogLevel.TRACE]: dim,
  [LogLevel.DEBUG]: dim,
  [LogLevel.INFO]: (value) => value,
  [LogLevel.WARNING]: yellow,
  [LogLevel.ERROR]: red,
  [LogLevel.FATAL]: red,
  [LogLevel.INTERNAL]: magenta,
};

export const defaultFormatters: MappedRecord<EntryType, () => ConsoleFormatterPlugin> = {
  [EntryType.GraphqlQuery]: () => new GraphqlQueryConsoleFormatter(),
  [EntryType.HttpRequest]: () => new HttpRequestConsoleFormatter(),
  [EntryType.HttpResponse]: () => new HttpResponseConsoleFormatter(),
  [EntryType.SqlQuery]: () => new SqlQueryConsoleFormatter(),
};
