import { FormatterPlugin, LogEntry } from '@debugr/core';
import * as templates from './templates';

export class HttpFormatter implements FormatterPlugin {
  readonly id: string = 'http';

  injectLogger(): void {}

  getEntryLabel(entry: LogEntry): string {
    switch (entry.data?.type) {
      case 'request':
        return 'HTTP request';
      case 'response':
        return 'HTTP response';
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  getEntryTitle(entry: LogEntry): string {
    switch (entry.data?.type) {
      case 'request':
        return `${entry.data.method} ${entry.data.uri}`;
      case 'response':
        return `HTTP ${entry.data.status} ${entry.data.message}`;
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  formatHtmlEntry(entry: LogEntry): string {
    switch (entry.data?.type) {
      case 'request':
        return templates.html.request(
          entry.data.method,
          entry.data.uri,
          entry.data.headers,
          entry.data.ip,
          entry.data.body,
          entry.data.bodyLength,
          entry.data.lengthMismatch,
        );
      case 'response':
        return templates.html.response(
          entry.data.status,
          entry.data.message,
          entry.data.headers,
          entry.data.body,
          entry.data.bodyLength,
          entry.data.lengthMismatch,
        );
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  formatConsoleEntry(entry: LogEntry): string {
    switch (entry.data?.type) {
      case 'request':
        return templates.console.request(
          entry.data.method,
          entry.data.uri,
          entry.data.headers,
          entry.data.ip,
          entry.data.bodyLength,
          entry.data.lengthMismatch,
        );
      case 'response':
        return templates.console.response(
          entry.data.status,
          entry.data.message,
          entry.data.headers,
          entry.data.bodyLength,
          entry.data.lengthMismatch,
        );
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }
}
