import type { TContextBase, TContextShape } from '@debugr/core';
import { EntryType } from '@debugr/core';
import type { HttpRequestLogEntry } from '@debugr/http-common';
import { escapeHtml } from '../../templates';
import { AbstractHttpHtmlFormatter } from './abstract';

export class HttpRequestHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHttpHtmlFormatter<TTaskContext, TGlobalContext> {
  public readonly id = 'debugr-http-request-html-formatter';
  public readonly entryType = EntryType.HttpRequest;

  public getEntryLabel(): string {
    return 'HTTP request';
  }

  public getEntryTitle(entry: HttpRequestLogEntry<TTaskContext, TGlobalContext>): string {
    return `${entry.data.method} ${entry.data.uri}`;
  }

  public renderEntry({ data, error }: HttpRequestLogEntry<TTaskContext, TGlobalContext>): string {
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
}
