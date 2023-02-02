import type { MappedRecord } from '@debugr/core';
import { EntryType, LogLevel } from '@debugr/core';
import type { ConsoleFormatterPlugin } from './formatters';
import {
  GraphqlQueryConsoleFormatter,
  HttpRequestConsoleFormatter,
  HttpResponseConsoleFormatter,
  SqlQueryConsoleFormatter,
} from './formatters';
import type { ConsoleStyleName } from './types';

export const defaultLevelMap: MappedRecord<LogLevel, string> = {
  [LogLevel.TRACE]: 'cc',
  [LogLevel.DEBUG]: 'dd',
  [LogLevel.INFO]: 'ii',
  [LogLevel.WARNING]: 'WW',
  [LogLevel.ERROR]: 'EE',
  [LogLevel.FATAL]: 'FF',
  [LogLevel.INTERNAL]: 'ii',
};

export const defaultColorMap: MappedRecord<LogLevel, ConsoleStyleName> = {
  [LogLevel.TRACE]: 'dim',
  [LogLevel.DEBUG]: 'dim',
  [LogLevel.INFO]: 'none',
  [LogLevel.WARNING]: 'yellow',
  [LogLevel.ERROR]: 'red',
  [LogLevel.FATAL]: 'red',
  [LogLevel.INTERNAL]: 'magenta',
};

export const defaultFormatters: MappedRecord<EntryType, () => ConsoleFormatterPlugin> = {
  [EntryType.GraphqlQuery]: () => new GraphqlQueryConsoleFormatter(),
  [EntryType.HttpRequest]: () => new HttpRequestConsoleFormatter(),
  [EntryType.HttpResponse]: () => new HttpResponseConsoleFormatter(),
  [EntryType.SqlQuery]: () => new SqlQueryConsoleFormatter(),
};
