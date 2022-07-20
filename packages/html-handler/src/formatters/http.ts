import {
  FormatterPlugin,
  TContextBase,
  TContextShape,
  HttpLogEntry,
  HttpRequestData,
  HttpResponseData,
  HttpHeaders,
} from '@debugr/core';
import { escapeHtml, formatBytes, renderCode, renderDetails } from '../templates';

const httpStatusMap: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  306: 'Switch Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

export class HttpHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements FormatterPlugin<TTaskContext, TGlobalContext>
{
  public readonly id: string = 'http-html';

  public readonly entryFormat: string = 'http';

  public readonly targetHandler: string = 'html';

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): HttpHtmlFormatter<TTaskContext, TGlobalContext> {
    return new HttpHtmlFormatter<TTaskContext, TGlobalContext>();
  }

  injectLogger(): void {}

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

  formatEntry(entry: HttpLogEntry<TTaskContext, TGlobalContext>): string {
    switch (entry.data?.type) {
      case 'request':
        return this.formatRequest(entry.data);
      case 'response':
        return this.formatResponse(entry.data);
    }

    throw new Error('This entry cannot be formatted by the HttpFormatter plugin');
  }

  protected formatRequest(data: HttpRequestData): string {
    const method = data.method.toUpperCase();
    const uri = decodeURIComponent(data.uri);
    const parts: string[] = [
      `<p class="mono"><strong>${escapeHtml(method)}</strong> ${escapeHtml(uri)}</p>`,
    ];

    if (data.headers) {
      parts.push(renderDetails('Headers:', renderCode(this.formatHeadersMap(data.headers))));
    }

    if (data.bodyLength !== undefined && data.bodyLength > 0) {
      parts.push(this.formatBody(data));
    }

    if (data.ip !== undefined) {
      const ip = escapeHtml(data.ip);
      parts.push(`<p class="text-muted"><small><strong>Client IP:</strong> ${ip}</small></p>`);
    }

    return parts.join('\n            ');
  }

  protected formatResponse(data: HttpResponseData): string {
    const status = data.status.toString();
    const message = data.message ?? httpStatusMap[data.status] ?? '(unknown)';
    const parts: string[] = [
      `<p class="mono"><strong>${escapeHtml(status)}</strong> ${message}</p>`,
    ];

    if (data.headers) {
      parts.push(renderDetails('Headers:', renderCode(this.formatHeadersMap(data.headers))));
    }

    if (data.bodyLength !== undefined && data.bodyLength > 0) {
      parts.push(this.formatBody(data));
    }

    return parts.join('\n            ');
  }

  protected formatHeadersMap(headers: HttpHeaders): string {
    return Object.entries(headers)
      .map(([header, value]) =>
        Array.isArray(value) ? `${header}: ${value.join(`\n${header}: `)}` : `${header}: ${value}`,
      )
      .join('\n');
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
