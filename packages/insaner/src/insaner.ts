import { Logger, LogLevel, Plugin, TContextBase } from '@debugr/core';
import { HttpForcedResponse, HttpRequest, HttpResponse, MiddlewareNext } from 'insaner';
import { NormalizedOptions, Options } from './types';
import { filterHeaders, normalizeOptions } from './utils';

export class InsanerLogger<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> implements Plugin<Partial<TContext>, TGlobalContext>
{
  readonly id: string = 'insaner';

  private readonly options: NormalizedOptions;

  private logger: Logger<Partial<TContext>, TGlobalContext>;

  constructor(options?: Options) {
    this.options = normalizeOptions(options);
  }

  injectLogger(logger: Logger<Partial<TContext>, TGlobalContext>): void {
    this.logger = logger;
  }

  createMiddlewareHandler() {
    return async (next: MiddlewareNext) => {
      await this.logger.fork(next);
    };
  }

  createRequestHandler() {
    return (request: HttpRequest) => {
      this.logger.add({
        pluginId: 'http',
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

  createErrorHandler() {
    return (request: HttpRequest, error: Error) => {
      if (!(error instanceof HttpForcedResponse)) {
        this.logger.error(error);
      }
    };
  }

  createResponseHandler() {
    return (response: HttpResponse) => {
      const level =
        response.status >= (this.options.e4xx ? 400 : 500) ? LogLevel.ERROR : this.options.level;

      this.logger.add({
        pluginId: 'http',
        level,
        data: {
          type: 'response',
          status: response.status,
          message: '',
          headers: filterHeaders(response.headers, this.options.response.excludeHeaders),
        },
      });

      this.logger.flush();
    };
  }
}
