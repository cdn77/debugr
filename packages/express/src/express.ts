import { Plugin, Logger, LogLevel, TContextBase, TContextShape } from '@debugr/core';
import { Handler, ErrorRequestHandler, Request, Response } from 'express';
import { HttpLogEntry, NormalizedOptions, Options } from './types';
import {
  filterHeaders,
  isCaptureEnabled,
  normalizeContentLength,
  normalizeContentType,
  normalizeOptions,
} from './utils';

export class ExpressLogger<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements Plugin<Partial<TTaskContext>, TGlobalContext>
{
  public readonly id: string = 'express';

  public readonly entryFormat: 'http' = 'http';

  private readonly options: NormalizedOptions;

  private logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  public constructor(options?: Options) {
    this.options = normalizeOptions(options);
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: Options,
  ): ExpressLogger<Partial<TTaskContext>, TGlobalContext> {
    return new ExpressLogger<Partial<TTaskContext>, TGlobalContext>(options);
  }

  public injectLogger(logger: Logger<Partial<TTaskContext>, TGlobalContext>): void {
    this.logger = logger;
  }

  public createRequestHandler(): Handler {
    return (req, res, next) => {
      return this.logger.runTask(() => {
        this.logHttpRequest(this.logger, this.options, req);
        this.logHttpResponse(this.logger, this.options, res).finally(() => this.logger.flush());
        return next();
      });
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
    logger: Logger<Partial<TTaskContext>, TGlobalContext>,
    options: NormalizedOptions,
    request: Request,
  ): void {
    logger.setContextProperty('restRoute', request.originalUrl);
    logger.setContextProperty('restMethod', request.method);
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
    logger: Logger<Partial<TTaskContext>, TGlobalContext>,
    options: NormalizedOptions,
    request: Request,
    contentType?: string,
    contentLength?: number,
    body?: string,
  ): void {
    const bodyLength = body ? body.length : undefined;
    const canCapture = isCaptureEnabled(options.request.captureBody, contentType, bodyLength);
    const lengthMismatch = !!body && !canCapture;

    const entry: Omit<HttpLogEntry, 'ts' | 'context'> = {
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
    };
    logger.add(entry);
  }

  private captureRequestBody(request: Request, cb: (err: any | null, body?: string) => void): void {
    let buffer: string = '';
    request.prependListener('data', (chunk) => (buffer += chunk.toString()));
    request.once('error', (err) => cb(err));
    request.once('end', () => cb(null, buffer));
  }

  private async captureResponseBody(response: Response): Promise<string> {
    const write = response.write;
    const end = response.end;
    let buffer: string = '';

    response.write = (chunk: any, encoding?: any, cb?: any) => {
      buffer += chunk.toString();
      return write.call(response, chunk, encoding, cb);
    };

    response.end = (chunk: any, encoding?: any, cb?: any) => {
      if (chunk && typeof chunk !== 'function') {
        buffer += chunk.toString();
      }

      return end.call(response, chunk, encoding, cb);
    };

    return new Promise((resolve, reject) => {
      response.once('finish', () => resolve(buffer));
      response.once('error', reject);
    });
  }

  private async logHttpResponse<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  >(
    logger: Logger<Partial<TTaskContext>, TGlobalContext>,
    options: NormalizedOptions,
    response: Response,
  ): Promise<void> {
    const body = await this.captureResponseBody(response);
    const headers = response.getHeaders();
    const contentType = normalizeContentType(headers['content-type']);
    const contentLength = normalizeContentLength(headers['content-length']);
    const canCapture = isCaptureEnabled(options.response.captureBody, contentType, contentLength);
    const bodyLength = body ? body.length : undefined;
    const lengthMismatch =
      bodyLength !== undefined && contentLength !== undefined && bodyLength !== contentLength;
    const level =
      response.statusCode >= (options.e4xx ? 400 : 500) ? LogLevel.ERROR : options.level;

    const entry: Omit<HttpLogEntry, 'ts' | 'context'> = {
      format: this.entryFormat,
      level,
      data: {
        type: 'response',
        status: response.statusCode,
        message: response.statusMessage,
        headers: filterHeaders(headers, options.response.excludeHeaders),
        body: canCapture ? body : undefined,
        bodyLength,
        lengthMismatch,
      },
    };
    logger.add(entry);
  }
}
