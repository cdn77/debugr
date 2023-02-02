import type { TContextBase, TContextShape } from '@debugr/core';
import { formatBytes } from '@debugr/core';
import type { HttpRequestData, HttpResponseData } from '@debugr/http-common';
import { formatHttpHeaders } from '@debugr/http-common';
import type { ConsoleStyle } from '../../types';
import { AbstractConsoleFormatter } from '../abstract';

export abstract class AbstractHttpConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
  protected formatCommonParts(style: ConsoleStyle, data: HttpRequestData | HttpResponseData, error?: Error): string {
    return this.formatParts(
      data.headers && style.dim(formatHttpHeaders(data.headers)),
      data.bodyLength !== undefined && this.formatBodyInfo(style, data),
      error && this.formatError(error, style),
    );
  }

  protected formatBodyInfo(style: ConsoleStyle, data: HttpRequestData | HttpResponseData): string {
    if (data.bodyLength === undefined) {
      return '';
    }

    const suffix = data.lengthMismatch ? style.yellow('; content-length mismatch!') : '';
    return style.dim(`Body: ${formatBytes(data.bodyLength)}${suffix}`);
  }
}
