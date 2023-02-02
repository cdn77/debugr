import type { TContextBase, TContextShape } from '@debugr/core';
import { EntryType } from '@debugr/core';
import type { HttpRequestLogEntry } from '@debugr/http-common';
import type { ConsoleStyle } from '../../types';
import { AbstractHttpConsoleFormatter } from './abstract';

export class HttpRequestConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHttpConsoleFormatter<TTaskContext, TGlobalContext> {
  public readonly id = 'debugr-http-request-console-formatter';
  public readonly entryType = EntryType.HttpRequest;

  public formatEntry(
    { data, error }: HttpRequestLogEntry<TTaskContext, TGlobalContext>,
    style: ConsoleStyle,
  ): string {
    return this.formatParts(
      `${data.method.toUpperCase()} ${decodeURIComponent(data.uri)}`,
      this.formatCommonParts(style, data, error),
      data.ip && style.dim(`Client IP: ${data.ip}`),
    );
  }
}
