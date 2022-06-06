import { FormatterPlugin, TContextBase, TContextShape } from '@debugr/core';
import { HttpLogEntry } from '@debugr/express';
import * as templates from './templates';

export class HttpConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<Partial<TTaskContext>, TGlobalContext>
{
  public readonly id: string = 'http';

  public readonly entryFormat: string = 'http';

  public readonly targetHandler: string = 'console';

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): HttpConsoleFormatter<Partial<TTaskContext>, TGlobalContext> {
    return new HttpConsoleFormatter<Partial<TTaskContext>, TGlobalContext>();
  }

  injectLogger(): void {}

  getEntryLabel(entry: HttpLogEntry<Partial<TTaskContext>, TGlobalContext>): string {
    switch (entry.data?.type) {
      case 'request':
        return 'HTTP request';
      case 'response':
        return 'HTTP response';
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  getEntryTitle(entry: HttpLogEntry<Partial<TTaskContext>, TGlobalContext>): string {
    switch (entry.data?.type) {
      case 'request':
        return `${entry.data.method} ${entry.data.uri}`;
      case 'response':
        return `HTTP ${entry.data.status} ${entry.data.message}`;
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  formatEntry(entry: HttpLogEntry<Partial<TTaskContext>, TGlobalContext>): string {
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
