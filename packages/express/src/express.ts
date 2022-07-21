import { Plugin, Logger, LogLevel, TContextBase, TContextShape } from '@debugr/core';
import {
  HttpLogEntry,
  filterHeaders,
  isCaptureEnabled,
  normalizeContentLength,
  normalizeContentType,
} from '@debugr/http-common';
import type { Handler, ErrorRequestHandler, Request, Response } from 'express';
import { NormalizedOptions, Options, ResponseInfo } from './types';
import { normalizeOptions } from './utils';

export class ExpressPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements Plugin<TTaskContext, TGlobalContext>
{
  public readonly id: string = 'express';

  public readonly entryFormat: 'http' = 'http';

  private readonly options: NormalizedOptions;

  private logger: Logger<TTaskContext, TGlobalContext>;

  public constructor(options?: Options) {
    this.options = normalizeOptions(options);
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: Options,
  ): ExpressPlugin<TTaskContext, TGlobalContext> {
    return new ExpressPlugin<TTaskContext, TGlobalContext>(options);
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public createRequestHandler(): Handler {
    return (req, res, next) => {
      return this.logger.runTask(
        async () =>
          new Promise((resolve, reject) => {
            this.logHttpRequest(this.logger, this.options, req);
            this.logHttpResponse(this.logger, this.options, res).then(resolve, reject);
            return next();
          }),
      );
    };
  }

  public createErrorHandler(): ErrorRequestHandler {
    return (err, req, res, next) => {
      this.logger.log(LogLevel.ERROR, err);
      next(err);
    };
  }

  private logHttpRequest<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  >(
    logger: Logger<TTaskContext, TGlobalContext>,
    options: NormalizedOptions,
    request: Request,
  ): void {
    const contentType = normalizeContentType(request.header('content-type'));
    const contentLength = normalizeContentLength(request.header('content-length'));

    if (isCaptureEnabled(options.request.captureBody, contentType, contentLength)) {
      this.captureRequestBody(request, (err, body) =>
        this.doLogRequest(logger, options, request, contentType, contentLength, body),
      );
    } else {
      this.doLogRequest(logger, options, request, contentType, contentLength);
    }
  }

  private doLogRequest<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  >(
    logger: Logger<TTaskContext, TGlobalContext>,
    options: NormalizedOptions,
    request: Request,
    contentType?: string,
    contentLength?: number,
    body?: string,
  ): void {
    const bodyLength = body ? body.length : undefined;
    const canCapture = isCaptureEnabled(options.request.captureBody, contentType, bodyLength);
    const lengthMismatch = !!body && !canCapture;

    logger.add<HttpLogEntry>({
      format: this.entryFormat,
      level: options.level,
      data: {
        type: 'request',
        method: request.method,
        uri: request.originalUrl,
        headers: filterHeaders(request.headers, options.request.excludeHeaders),
        ip: request.ip,
        body: canCapture ? body : undefined,
        bodyLength,
        lengthMismatch,
      },
    });
  }

  private captureRequestBody(request: Request, cb: (err: any | null, body?: string) => void): void {
    let buffer: string = '';
    request.prependListener('data', (chunk) => (buffer += chunk.toString()));
    request.once('error', (err) => cb(err));
    request.once('end', () => cb(null, buffer));
  }

  private async captureResponseBody(
    response: Response,
    options: NormalizedOptions,
  ): Promise<ResponseInfo> {
    const write = response.write;
    const end = response.end;
    let info: ResponseInfo | undefined;
    let capture: boolean | undefined;

    function handleChunk(chunk: any): void {
      if (!info) {
        const headers = response.getHeaders();
        const contentType = normalizeContentType(headers['content-type']);
        const contentLength = normalizeContentLength(headers['content-length']);
        capture = isCaptureEnabled(options.response.captureBody, contentType, contentLength);

        info = {
          headers,
          contentLength,
          body: capture ? '' : undefined,
          bodyLength: 0,
        };
      }

      if (Buffer.isBuffer(chunk) || typeof chunk === 'string') {
        capture && (info.body += chunk.toString());
        info.bodyLength += Buffer.isBuffer(chunk) ? chunk.byteLength : chunk.length;
      }
    }

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

  private async logHttpResponse<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  >(
    logger: Logger<TTaskContext, TGlobalContext>,
    options: NormalizedOptions,
    response: Response,
  ): Promise<void> {
    const { headers, contentLength, body, bodyLength } = await this.captureResponseBody(
      response,
      options,
    );

    const lengthMismatch =
      bodyLength !== undefined && contentLength !== undefined && bodyLength !== contentLength;
    const level =
      response.statusCode >= (options.e4xx ? 400 : 500) ? LogLevel.ERROR : options.level;

    logger.add<HttpLogEntry>({
      format: this.entryFormat,
      level,
      data: {
        type: 'response',
        status: response.statusCode,
        message: response.statusMessage,
        headers: filterHeaders(headers, options.response.excludeHeaders),
        body,
        bodyLength,
        lengthMismatch,
      },
    });
  }
}
