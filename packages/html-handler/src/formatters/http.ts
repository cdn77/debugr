import { formatBytes,TContextBase, TContextShape } from '@debugr/core';
import {
  formatHttpHeaders,
  getHttpStatusMessage,
  HttpLogEntry,
  HttpRequestData,
  HttpResponseData,
} from '@debugr/http-common';
import { escapeHtml, renderCode, renderDetails } from '../templates';
import { AbstractHtmlFormatter } from './abstract';

export class HttpHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHtmlFormatter<TTaskContext, TGlobalContext> {
  public readonly id: string = 'debugr-http-html-formatter';

  public readonly entryFormat: string = 'http';

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): HttpHtmlFormatter<TTaskContext, TGlobalContext> {
    return new HttpHtmlFormatter<TTaskContext, TGlobalContext>();
  }

  getEntryLabel(entry: HttpLogEntry<TTaskContext, TGlobalContext>): string {
    switch (entry.data?.type) {
      case 'request':
        return 'HTTP request';
      case 'response':
        return 'HTTP response';
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  getEntryTitle(entry: HttpLogEntry<TTaskContext, TGlobalContext>): string {
    switch (entry.data?.type) {
      case 'request':
        return `${entry.data.method} ${entry.data.uri}`;
      case 'response':
        return `HTTP ${entry.data.status} ${entry.data.message}`;
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  renderEntry(entry: HttpLogEntry<TTaskContext, TGlobalContext>): string {
    switch (entry.data?.type) {
      case 'request':
        return this.renderRequest(entry.data, entry.error);
      case 'response':
        return this.renderResponse(entry.data, entry.error);
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  protected renderRequest(data: HttpRequestData, error?: Error): string {
    const method = data.method.toUpperCase();
    const uri = decodeURIComponent(data.uri);
    const ip = data.ip !== undefined ? escapeHtml(data.ip) : undefined;

    return this.renderParts(
      `<p class="mono"><strong>${escapeHtml(method)}</strong> ${escapeHtml(uri)}</p>`,
      this.renderCommonParts(data, error),
      ip !== undefined &&
        `<p class="text-muted"><small><strong>Client IP:</strong> ${ip}</small></p>`,
    );
  }

  protected renderResponse(data: HttpResponseData, error?: Error): string {
    const status = data.status.toString();
    const message = data.message ?? getHttpStatusMessage(data.status);

    return this.renderParts(
      `<p class="mono"><strong>${escapeHtml(status)}</strong> ${message}</p>`,
      this.renderCommonParts(data, error),
    );
  }

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
