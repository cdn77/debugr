import { Logger, LogLevel, Plugin, TContextBase, TContextShape } from '@debugr/core';
import { HttpForcedResponse, HttpRequest, HttpResponse, MiddlewareNext } from 'insaner';
import { HttpLogEntry, NormalizedOptions, Options } from './types';
import { filterHeaders, normalizeOptions } from './utils';

export class InsanerLogger<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> implements Plugin<Partial<TTaskContext>, TGlobalContext>
{
  public readonly id: string = 'insaner';

  public readonly entryFormat: string = 'http';

  private readonly options: NormalizedOptions;

  private logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  constructor(options?: Options) {
    this.options = normalizeOptions(options);
  }

  injectLogger(logger: Logger<Partial<TTaskContext>, TGlobalContext>): void {
    this.logger = logger;
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: Options,
  ): InsanerLogger<Partial<TTaskContext>, TGlobalContext> {
    return new InsanerLogger<Partial<TTaskContext>, TGlobalContext>(options);
  }

  createMiddlewareHandler() {
    return async (next: MiddlewareNext) => {
      await this.logger.runTask(next);
    };
  }

  createRequestHandler() {
    return (request: HttpRequest) => {
      const entry: Omit<HttpLogEntry, 'ts' | 'context'> = {
        format: 'http',
        level: this.options.level,
        data: {
          type: 'request',
          method: request.method,
          uri: request.url.toString(),
          headers: filterHeaders(request.headers, this.options.request.excludeHeaders),
        },
      };
      this.logger.add(entry);
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

      const entry: Omit<HttpLogEntry, 'ts' | 'context'> = {
        format: 'http',
        level,
        data: {
          type: 'response',
          status: response.status,
          message: '',
          headers: filterHeaders(response.headers, this.options.response.excludeHeaders),
        },
      };
      this.logger.add(entry);

      this.logger.flush();
    };
  }
}
