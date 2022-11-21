import type { TContextBase, TContextShape } from '@debugr/core';
import { formatBytes } from '@debugr/core';
import type { HttpRequestData, HttpResponseData } from '@debugr/http-common';
import { formatHttpHeaders } from '@debugr/http-common';
import { dim, yellow } from 'ansi-colors';
import { AbstractConsoleFormatter } from '../abstract';

export abstract class AbstractHttpConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractConsoleFormatter<TTaskContext, TGlobalContext> {
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
