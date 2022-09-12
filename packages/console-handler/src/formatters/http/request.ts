import type { TContextBase, TContextShape } from '@debugr/core';
import type { HttpRequestLogEntry } from '@debugr/http-common';
import { dim } from 'ansi-colors';
import { AbstractHttpConsoleFormatter } from './abstract';

export class HttpRequestConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
  > extends AbstractHttpConsoleFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-http-request-console-formatter';

  readonly entryType: string = 'http.request';

  formatEntry({ data, error }: HttpRequestLogEntry<TTaskContext, TGlobalContext>): string {
    return this.formatParts(
      `${data.method.toUpperCase()} ${decodeURIComponent(data.uri)}`,
      this.formatCommonParts(data, error),
      data.ip && dim(`Client IP: ${data.ip}`),
    );
  }
}
