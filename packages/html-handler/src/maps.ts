import { LogLevel } from '@debugr/core';
import type { HtmlFormatterPlugin } from './formatters';
import {
  GraphQLQueryHtmlFormatter,
  HttpRequestHtmlFormatter,
  HttpResponseHtmlFormatter,
  SqlQueryHtmlFormatter,
} from './formatters';

export const defaultLevelMap: Record<number, string> = {
  [LogLevel.TRACE]: 'trace',
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARNING]: 'warning',
  [LogLevel.ERROR]: 'error',
  [LogLevel.FATAL]: 'fatal',
  [-1]: 'internal',
  0: 'unknown',
};

export const defaultColorMap: Record<number, string> = {
  [LogLevel.TRACE]: '#cccccc',
  [LogLevel.DEBUG]: '#c8edff',
  [LogLevel.INFO]: '#ffffaa',
  [LogLevel.WARNING]: '#ffaa00',
  [LogLevel.ERROR]: '#ff4444',
  [LogLevel.FATAL]: '#ff0000',
  [-1]: '#da47ff',
  0: '#4747ff',
};

export const defaultFormatters: Record<string, () => HtmlFormatterPlugin> = {
  'graphql.query': () => new GraphQLQueryHtmlFormatter(),
  'http.request': () => new HttpRequestHtmlFormatter(),
  'http.response': () => new HttpResponseHtmlFormatter(),
  'sql.query': () => new SqlQueryHtmlFormatter(),
};
