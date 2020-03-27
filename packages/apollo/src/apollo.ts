import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { Container, ContainerAware, Factory, Logger, Plugin } from '@debugr/core';
import { GraphQLFormatter } from '@debugr/graphql-formatter';
import { FullOptions, Options } from './types';

export class ApolloLogger implements ContainerAware, Plugin, ApolloServerPlugin {
  readonly id: string = 'apollo';

  private readonly options: FullOptions;

  private createLogger: Factory<Logger>;

  constructor(options?: Options) {
    this.options = {
      level: options?.level || Logger.INFO,
    };
  }

  injectContainer(container: Container): void {
    this.createLogger = container.createFactory('logger');

    const pluginManager = container.get('pluginManager');

    if (!pluginManager.has('graphql')) {
      pluginManager.register(new GraphQLFormatter());
    }
  }

  requestDidStart({ context }: GraphQLRequestContext): GraphQLRequestListener {
    const logger: Logger = context.logger || this.createLogger();
    const options = this.options;

    return {
      didResolveOperation({ request, operation, operationName }): void {
        if (request.query) {
          logger.log('graphql', options.level, {
            query: request.query,
            variables: request.variables,
            operation:
              [operation?.operation, operationName].filter(v => !!v).join(' ') || undefined,
          });
        }
      },
      didEncounterErrors({ errors }): void {
        for (const err of errors) {
          const data = err.originalError
            ? {
                'original message': err.originalError.message,
                stack: err.originalError.stack,
              }
            : {};

          logger.error(err.message, {
            positions: err.positions,
            ...data,
          });
        }
      },
      willSendResponse({ context }): void {
        if (!context.logger) {
          logger.flush();
        }
      },
    };
  }
}
