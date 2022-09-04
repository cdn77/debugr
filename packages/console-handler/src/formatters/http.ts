import type { TContextBase, TContextShape } from '@debugr/core';
import { formatBytes } from '@debugr/core';
import type {
  HttpLogEntry,
  HttpRequestData,
  HttpResponseData,
} from '@debugr/http-common';
import { formatHttpHeaders } from '@debugr/http-common';
import { dim, yellow } from 'ansi-colors';
import { AbstractConsoleFormatter } from './abstract';

export class HttpConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-http-console-formatter';

  readonly entryFormat: string = 'http';

  formatEntry(entry: HttpLogEntry<TTaskContext, TGlobalContext>): string {
    switch (entry.data?.type) {
      case 'request':
        return this.formatRequest(entry.data, entry.error);
      case 'response':
        return this.formatResponse(entry.data, entry.error);
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  protected formatRequest(data: HttpRequestData, error?: Error): string {
    return this.formatParts(
      `${data.method.toUpperCase()} ${decodeURIComponent(data.uri)}`,
      this.formatCommonParts(data, error),
      data.ip && dim(`Client IP: ${data.ip}`),
    );
  }

  protected formatResponse(data: HttpResponseData, error?: Error): string {
    return this.formatParts(
      `HTTP ${data.status} ${data.message}`,
      this.formatCommonParts(data, error),
    );
  }

  protected formatCommonParts(data: HttpRequestData | HttpResponseData, error?: Error): string {
    return this.formatParts(
      data.headers && dim(formatHttpHeaders(data.headers)),
      data.bodyLength !== undefined && this.formatBodyInfo(data),
      error && this.formatError(error),
    );
  }

  protected formatBodyInfo(data: HttpRequestData | HttpResponseData): string {
    if (data.bodyLength === undefined) {
      return '';
    }

    const suffix = data.lengthMismatch ? yellow('; content-length mismatch!') : '';
    return dim(`Body: ${formatBytes(data.bodyLength)}${suffix}`);
  }
}
