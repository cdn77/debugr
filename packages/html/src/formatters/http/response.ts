import type { TContextBase, TContextShape } from '@debugr/core';
import { EntryType } from '@debugr/core';
import type { HttpResponseLogEntry } from '@debugr/http-common';
import { getHttpStatusMessage } from '@debugr/http-common';
import { escapeHtml } from '../../templates';
import { AbstractHttpHtmlFormatter } from './abstract';

export class HttpResponseHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHttpHtmlFormatter<TTaskContext, TGlobalContext> {
  public readonly id = 'debugr-http-response-html-formatter';
  public readonly entryType = EntryType.HttpResponse;

  public getEntryLabel(): string {
    return 'HTTP response';
  }

  public getEntryTitle({ data }: HttpResponseLogEntry<TTaskContext, TGlobalContext>): string {
    return `HTTP ${data.status} ${data.message ?? getHttpStatusMessage(data.status)}`;
  }

  public renderEntry({ data, error }: HttpResponseLogEntry<TTaskContext, TGlobalContext>): string {
    const status = data.status.toString();
    const message = data.message ?? getHttpStatusMessage(data.status);

    return this.renderParts(
      `<p class="mono"><strong>${escapeHtml(status)}</strong> ${message}</p>`,
      this.renderCommonParts(data, error),
    );
  }
}
