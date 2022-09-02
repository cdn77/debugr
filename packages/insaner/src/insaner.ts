import type { Logger, Plugin, TContextBase, TContextShape } from '@debugr/core';
import { LogLevel } from '@debugr/core';
import { filterHeaders, HttpLogEntry } from '@debugr/http-common';
import type { HttpRequest, HttpResponse, HttpServer, MiddlewareNext } from 'insaner';
import { HttpForcedResponse } from 'insaner';
import type { NormalizedOptions, Options } from './types';
import { normalizeOptions } from './utils';

export class InsanerPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements Plugin<TTaskContext, TGlobalContext>
{
  public readonly id: string = 'insaner';

  public readonly entryFormat: string = 'http';

  private readonly options: NormalizedOptions;

  private logger: Logger<TTaskContext, TGlobalContext>;

  constructor(options?: Options) {
    this.options = normalizeOptions(options);
  }

  injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: Options,
  ): InsanerPlugin<TTaskContext, TGlobalContext> {
    return new InsanerPlugin<TTaskContext, TGlobalContext>(options);
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
      this.logger.add<HttpLogEntry>({
        format: 'http',
        level: this.options.level,
        data: {
          type: 'request',
          method: request.method,
          uri: request.url.toString(),
          headers: filterHeaders(request.headers, this.options.request.excludeHeaders),
        },
      });
    };
  }

  protected createErrorHandler() {
    return (request: HttpRequest, error: Error) => {
      if (!(error instanceof HttpForcedResponse)) {
        this.logger.error(error);
      }
    };
  }

  protected createResponseHandler() {
    return (response: HttpResponse) => {
      const level =
        response.status >= (this.options.e4xx ? 400 : 500) ? LogLevel.ERROR : this.options.level;

      this.logger.add<HttpLogEntry>({
        format: 'http',
        level,
        data: {
          type: 'response',
          status: response.status,
          headers: filterHeaders(response.headers, this.options.response.excludeHeaders),
        },
      });
    };
  }
}
