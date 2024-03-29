import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { EntryType, PluginKind } from '@debugr/core';
import type { HttpRequestLogEntry, HttpResponseLogEntry } from '@debugr/http-common';
import { normalizeContentLength } from '@debugr/http-common';
import type { ErrorRequestHandler, Handler, Request, Response } from 'express';
import type { ExpressCollectorOptions, NormalizedOptions, ResponseInfo } from './types';
import { normalizeOptions } from './utils';

export class ExpressCollector<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements CollectorPlugin<TTaskContext, TGlobalContext>
{
  public readonly id = 'express';
  public readonly kind = PluginKind.Collector;
  public readonly entryTypes = [EntryType.HttpRequest, EntryType.HttpResponse];

  private readonly options: NormalizedOptions;
  private logger: Logger<TTaskContext, TGlobalContext>;

  public constructor(options?: ExpressCollectorOptions) {
    this.options = normalizeOptions(options);
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public createRequestHandler(): Handler {
    return (req, res, next) => {
      return this.logger.runTask(
        async () =>
          new Promise((resolve, reject) => {
            this.logHttpRequest(req);
            this.logHttpResponse(res).then(resolve, reject);
            return next();
          }),
      );
    };
  }

  public createErrorHandler(): ErrorRequestHandler {
    return (err, req, res, next) => {
      this.logger.log(this.options.uncaughtLevel, err);
      next(err);
    };
  }

  private logHttpRequest(request: Request): void {
    if (
      this.options.request.isCaptureEnabled(
        request.header('content-type'),
        request.header('content-length'),
      )
    ) {
      this.captureRequestBody(request).then((body) => this.doLogRequest(request, body));
    } else {
      this.doLogRequest(request);
    }
  }

  private doLogRequest(request: Request, body?: string): void {
    const contentLength = normalizeContentLength(request.header('content-length'));
    const bodyLength = body !== undefined ? body.length : undefined;
    const lengthMismatch =
      bodyLength !== undefined && contentLength !== undefined
        ? bodyLength !== contentLength
        : undefined;

    this.logger.add<HttpRequestLogEntry>({
      type: EntryType.HttpRequest,
      level: this.options.level,
      data: {
        method: request.method,
        uri: request.originalUrl,
        headers: this.options.request.filterHeaders(request.headers),
        ip: request.ip,
        body,
        bodyLength,
        lengthMismatch,
      },
    });
  }

  private async captureRequestBody(request: Request): Promise<string> {
    let buffer: string = '';
    request.prependListener('data', (chunk) => (buffer += chunk.toString()));

    return new Promise((resolve, reject) => {
      request.once('error', reject);
      request.once('end', () => resolve(buffer));
    });
  }

  private async captureResponseBody(response: Response): Promise<ResponseInfo> {
    const write = response.write;
    const end = response.end;
    let capture: boolean | undefined;
    let info: ResponseInfo | undefined;

    const handleChunk = (chunk: any): void => {
      if (!info) {
        const headers = response.getHeaders();
        const contentLength = normalizeContentLength(headers['content-length']);

        capture = this.options.response.isCaptureEnabled(
          headers['content-type'],
          headers['content-length'],
        );

        info = {
          headers,
          contentLength,
          body: capture ? '' : undefined,
          bodyLength: 0,
        };
      }

      try {
        if (Buffer.isBuffer(chunk) || typeof chunk === 'string') {
          info.bodyLength += Buffer.isBuffer(chunk) ? chunk.byteLength : chunk.length;
          capture && (info.body += chunk.toString());
        }
      } catch (e) {
        this.logger.warning('Failed to capture response body', e);
        capture = false;
      }
    };

    response.write = (chunk: any, encoding?: any, cb?: any) => {
      handleChunk(chunk);
      return write.call(response, chunk, encoding, cb);
    };

    response.end = (chunk: any, encoding?: any, cb?: any) => {
      handleChunk(chunk);
      return end.call(response, chunk, encoding, cb);
    };

    return new Promise((resolve, reject) => {
      response.once('finish', () => (info ? resolve(info) : reject()));
      response.once('error', reject);
    });
  }

  private async logHttpResponse(response: Response): Promise<void> {
    const { headers, contentLength, body, bodyLength } = await this.captureResponseBody(response);

    const lengthMismatch =
      bodyLength !== undefined && contentLength !== undefined && bodyLength !== contentLength;
    const level =
      response.statusCode >= (this.options.e4xx ? 400 : 500)
        ? this.options.errorLevel
        : this.options.level;

    this.logger.add<HttpResponseLogEntry>({
      type: EntryType.HttpResponse,
      level,
      data: {
        status: response.statusCode,
        message: response.statusMessage,
        headers: this.options.response.filterHeaders(headers),
        body,
        bodyLength,
        lengthMismatch,
      },
    });
  }
}
