import { FormatterPlugin, LogEntry } from '@debugr/core';
import * as templates from './templates';

export class HttpFormatter implements FormatterPlugin {
  readonly id: string = 'http';

  getEntryLabel(entry: LogEntry): string {
    return entry.data!.type === 'request' ? 'HTTP request' : 'HTTP response';
  }

  formatEntry(entry: LogEntry): string {
    if (entry.data) {
      if (entry.data.type === 'request') {
        return templates.request(
          entry.data.method,
          entry.data.uri,
          entry.data.headers,
          entry.data.ip,
          entry.data.body,
          entry.data.bodyLength,
          entry.data.lengthMismatch,
        );
      } else if (entry.data.type === 'response') {
        return templates.response(
          entry.data.status,
          entry.data.message,
          entry.data.headers,
          entry.data.body,
          entry.data.bodyLength,
          entry.data.lengthMismatch,
        );
      }
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }
}
