import type { MappedRecord } from '@debugr/core';
import { EntryType, LogLevel } from '@debugr/core';
import type { HtmlFormatterPlugin } from './formatters';
import {
  GraphqlQueryHtmlFormatter,
  HttpRequestHtmlFormatter,
  HttpResponseHtmlFormatter,
  SqlQueryHtmlFormatter,
} from './formatters';

export const defaultLevelMap: MappedRecord<LogLevel, string> = {
  [LogLevel.TRACE]: 'trace',
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARNING]: 'warning',
  [LogLevel.ERROR]: 'error',
  [LogLevel.FATAL]: 'fatal',
  [LogLevel.INTERNAL]: 'internal',
};

export const defaultColorMap: MappedRecord<LogLevel, string> = {
  [LogLevel.TRACE]: '#cccccc',
  [LogLevel.DEBUG]: '#c8edff',
  [LogLevel.INFO]: '#ffffaa',
  [LogLevel.WARNING]: '#ffaa00',
  [LogLevel.ERROR]: '#ff4444',
  [LogLevel.FATAL]: '#ff0000',
  [LogLevel.INTERNAL]: '#da47ff',
};

export const defaultFormatters: MappedRecord<EntryType, () => HtmlFormatterPlugin> = {
  [EntryType.GraphqlQuery]: () => new GraphqlQueryHtmlFormatter(),
  [EntryType.HttpRequest]: () => new HttpRequestHtmlFormatter(),
  [EntryType.HttpResponse]: () => new HttpResponseHtmlFormatter(),
  [EntryType.SqlQuery]: () => new SqlQueryHtmlFormatter(),
};
