import { FormatterPlugin, TContextBase, TContextShape } from '@debugr/core';
import { HttpLogEntry } from '@debugr/express';
import * as templates from './templates';

export class HttpHtmlFormatter<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<Partial<TTaskContext>, TGlobalContext>
{
  public readonly id: string = 'http';

  public readonly entryFormat: string = 'http';

  public readonly handlerSupport: string = 'html';

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
}
