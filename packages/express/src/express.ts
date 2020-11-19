import { Container, ContainerAware, Factory, Plugin, Logger } from '@debugr/core';
import { HttpFormatter } from '@debugr/http-formatter';
import { Handler, ErrorRequestHandler } from 'express';
import { NormalizedOptions, Options } from './types';
import { normalizeOptions } from './utils';
import { logHttpRequest } from './middleware/request';
import { logHttpResponse } from './middleware/response';

export class ExpressLogger implements ContainerAware, Plugin {
  readonly id: string = 'express';

  private readonly options: NormalizedOptions;

  private createLogger: Factory<Logger>;

  constructor(options?: Options) {
    this.options = normalizeOptions(options);
  }

  injectContainer(container: Container): void {
    this.createLogger = container.createFactory('logger');

    const pluginManager = container.get('pluginManager');

    if (!pluginManager.has('http')) {
      pluginManager.register(new HttpFormatter());
    }
  }

  createRequestHandler(): Handler {
    return (req, res, next) => {
      const logger = (req.logger = this.createLogger());
      logHttpRequest(logger, this.options, req);
      logHttpResponse(logger, this.options, res).finally(() => logger.flush());
      next();
    };
  }

  createErrorHandler(): ErrorRequestHandler {
    return (err, req, res, next) => {
      if (req.logger) {
        req.logger.log(Logger.ERROR, err);
      }

      next(err);
    };
  }
}
