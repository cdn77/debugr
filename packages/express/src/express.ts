import { Container, ContainerAware, Plugin, Logger, LogLevel } from '@debugr/core';
import { HttpFormatter } from '@debugr/http-formatter';
import { Handler, ErrorRequestHandler } from 'express';
import { NormalizedOptions, Options } from './types';
import { normalizeOptions } from './utils';
import { logHttpRequest } from './middleware/request';
import { logHttpResponse } from './middleware/response';

export class ExpressLogger implements ContainerAware, Plugin {
  readonly id: string = 'express';

  private readonly options: NormalizedOptions;

  private logger: Logger;

  constructor(options?: Options) {
    this.options = normalizeOptions(options);
  }

  injectContainer(container: Container): void {
    this.logger = container.get('logger');

    const pluginManager = container.get('pluginManager');

    if (!pluginManager.has('http')) {
      pluginManager.register(new HttpFormatter());
    }
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
