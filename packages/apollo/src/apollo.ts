import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { Logger, Plugin, LogLevel, TContextBase } from '@debugr/core';
// import { GraphQLFormatter } from '@debugr/graphql-formatter';
import { FullOptions, Options } from './types';

export class ApolloLogger<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> implements Plugin<Partial<TContext>, TGlobalContext>, ApolloServerPlugin
{
  readonly id: string = 'apollo';

  private readonly options: FullOptions;

  private logger: Logger<Partial<TContext>, TGlobalContext>;

  private autoFlush: boolean;

  constructor(options?: Options) {
    this.options = {
      level: options?.level || LogLevel.INFO,
    };
  }

  injectLogger(logger: Logger<Partial<TContext>, TGlobalContext>): void {
    this.logger = logger;
  }

  requestDidStart(): GraphQLRequestListener {
    const logger = this.logger;
    const options = this.options;
    const flush = this.autoFlush;

    return {
      didResolveOperation({ request, operation, operationName }): void {
        if (request.query) {
          logger.add({
            pluginId: 'graphql',
            level: options.level,
            data: {
              query: request.query,
              variables: request.variables,
              operation:
                [operation?.operation, operationName].filter((v) => !!v).join(' ') || undefined,
            },
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
      willSendResponse(): void {
        if (flush) {
          logger.flush();
        }
      },
    };
  }
}
