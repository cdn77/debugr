import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { EntryType, PluginKind } from '@debugr/core';
import type { HttpRequestLogEntry, HttpResponseLogEntry } from '@debugr/http-common';
import type { HttpRequest, HttpResponse, HttpServer, MiddlewareNext } from 'insaner';
import { HttpForcedResponse } from 'insaner';
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
    server.registerMiddleware(this.createMiddlewareHandler());
    server.addListener('request', this.createRequestHandler());
    server.addListener('error', this.createErrorHandler());
    server.addListener('response', this.createResponseHandler());
  }

  protected createMiddlewareHandler() {
    return async (next: MiddlewareNext) => {
      await this.logger.runTask(next);
    };
  }

  protected createRequestHandler() {
    return (request: HttpRequest) => {
      this.logger.add<HttpRequestLogEntry>({
        type: EntryType.HttpRequest,
        level: this.options.level,
        data: {
          method: request.method,
          uri: request.url.toString(),
          headers: this.options.request.filterHeaders(request.headers),
        },
      });
    };
  }

  protected createErrorHandler() {
    return (request: HttpRequest, error: Error) => {
      if (!(error instanceof HttpForcedResponse)) {
        this.logger.log(this.options.uncaughtLevel, error);
      }
    };
  }

  protected createResponseHandler() {
    return (response: HttpResponse) => {
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
        },
      });
    };
  }
}
