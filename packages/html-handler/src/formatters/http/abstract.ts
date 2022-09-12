import type { TContextBase, TContextShape } from '@debugr/core';
import { formatBytes } from '@debugr/core';
import type { HttpRequestData, HttpResponseData } from '@debugr/http-common';
import { formatHttpHeaders } from '@debugr/http-common';
import { renderCode, renderDetails } from '../../templates';
import { AbstractHtmlFormatter } from '../abstract';

export abstract class AbstractHttpHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHtmlFormatter<TTaskContext, TGlobalContext> {
  protected renderCommonParts(data: HttpRequestData | HttpResponseData, error?: Error): string {
    return this.renderParts(
      data.headers && renderDetails('Headers:', renderCode(formatHttpHeaders(data.headers))),
      data.bodyLength !== undefined && data.bodyLength > 0 && this.formatBody(data),
      error && this.renderError(error),
    );
  }

  protected formatBody(data: HttpRequestData | HttpResponseData): string {
    const info: string[] = [];

    if (data.bodyLength !== undefined) {
      info.push(' <small class="text-muted">(');
      data.lengthMismatch && info.push('real: ');
      info.push(formatBytes(data.bodyLength));
      data.lengthMismatch && info.push('; content-length mismatch!');
      info.push(')</small>');
    }

    const caption = `Body${info.join('')}:`;

    if (data.body === undefined) {
      return `<p>${caption} omitted</p>`;
    }

    const contentType = data.headers && data.headers['content-type'];
    const json = typeof contentType === 'string' && /^application\/json(?:;|$)/.test(contentType);
    return renderDetails(caption, renderCode(data.body, json ? 'json' : undefined));
  }
}
