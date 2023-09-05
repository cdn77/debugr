import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { EntryType, PluginKind } from '@debugr/core';
import type { HttpRequestLogEntry, HttpResponseLogEntry } from '@debugr/http-common';
import type {
  HttpRequest,
  HttpResponse,
  ServerMiddlewareHandler,
  ServerMiddlewareNext,
} from 'insaner';
import type { HttpServer } from 'insaner';
import { LogStream } from './logStream';
import type { InsanerCollectorOptions, NormalizedOptions } from './types';
import { normalizeOptions } from './utils';

export class InsanerCollector<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements CollectorPlugin<TTaskContext, TGlobalContext>
{
  public readonly id = 'insaner';
  public readonly kind = PluginKind.Collector;
  public readonly entryTypes = [EntryType.HttpRequest, EntryType.HttpResponse];

  private readonly options: NormalizedOptions;
  private logger: Logger<TTaskContext, TGlobalContext>;

  public constructor(options?: InsanerCollectorOptions) {
    this.options = normalizeOptions(options);
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public install(server: HttpServer): void {
    server.registerMiddleware(this.createMiddleware());
    server.on('request', this.logRequest.bind(this));
    server.on('response', this.logResponse.bind(this));
    server.on('request-error', this.logError.bind(this));
  }

  private createMiddleware(): ServerMiddlewareHandler {
    return async (next: ServerMiddlewareNext) => {
      await this.logger.runTask(next);
    };
  }

  protected logRequest(request: HttpRequest) {
    const stream = new LogStream(
      this.options.request.isCaptureEnabled(
        request.headers['content-type'],
        request.headers['content-length'],
      ),
    );

    request.addTransform(stream);

    const ip = request.headers['x-forwarded-for'] ?? request.raw.socket.remoteAddress;

    this.logger.add<HttpRequestLogEntry>({
      type: EntryType.HttpRequest,
      level: this.options.level,
      data: {
        method: request.method,
        uri: request.url.toString(),
        headers: this.options.request.filterHeaders(request.headers),
        get body() {
          return stream.content;
        },
        get bodyLength() {
          return stream.length;
        },
        ip: Array.isArray(ip) ? ip.join(', ') : ip,
      },
    });
  }

  protected logError(request: HttpRequest, error: Error): void {
    this.logger.log(this.options.uncaughtLevel, error);
  }

  protected logResponse(response: HttpResponse): void {
    const stream = new LogStream(
      this.options.response.isCaptureEnabled(
        response.getHeader('content-type'),
        response.getHeader('content-length'),
      ),
    );

    response.addTransform(stream);

    const level =
      response.status >= (this.options.e4xx ? 400 : 500)
        ? this.options.errorLevel
        : this.options.level;

    this.logger.add<HttpResponseLogEntry>({
      type: EntryType.HttpResponse,
      level,
      data: {
        status: response.status,
        headers: this.options.response.filterHeaders(response.headers),
        get body() {
          return stream.content;
        },
        get bodyLength() {
          return stream.length;
        },
      },
    });
  }
}
