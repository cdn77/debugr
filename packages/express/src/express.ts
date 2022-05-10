import { Plugin, Logger, LogLevel, TContextBase } from '@debugr/core';
// import { HttpFormatter } from '@debugr/http-formatter';
import { Handler, ErrorRequestHandler } from 'express';
import { NormalizedOptions, Options } from './types';
import { normalizeOptions } from './utils';
import { logHttpRequest } from './middleware/request';
import { logHttpResponse } from './middleware/response';

export class ExpressLogger<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> implements Plugin<Partial<TContext>, TGlobalContext>
{
  readonly id: string = 'express';

  private readonly options: NormalizedOptions;

  private logger: Logger<Partial<TContext>, TGlobalContext>;

  constructor(options?: Options) {
    this.options = normalizeOptions(options);
  }

  injectLogger(logger: Logger<Partial<TContext>, TGlobalContext>): void {
    this.logger = logger;
  }

  createRequestHandler(): Handler {
    return (req, res, next) => {
      this.logger.ensureFork(() => {
        logHttpRequest(this.logger, this.options, req);
        logHttpResponse(this.logger, this.options, res).finally(() => this.logger.flush());
        next();
      });
    };
  }

  createErrorHandler(): ErrorRequestHandler {
    return (err, req, res, next) => {
      this.logger.log(LogLevel.ERROR, err);
      next(err);
    };
  }
}
