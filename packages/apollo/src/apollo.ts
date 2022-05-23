import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { Logger, Plugin, LogLevel, TContextBase, TContextShape } from '@debugr/core';
import { FullOptions, GraphQlLogEntry, Options } from './types';

export class ApolloLogger<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> implements Plugin<Partial<TTaskContext>, TGlobalContext>, ApolloServerPlugin
{
  readonly id: string = 'apollo';

  readonly entryFormat: 'graphql' = 'graphql';

  private readonly options: FullOptions;

  private logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  private autoFlush: boolean;

  constructor(options?: Options) {
    this.options = {
      level: options?.level || LogLevel.INFO,
    };
  }

  injectLogger(logger: Logger<Partial<TTaskContext>, TGlobalContext>): void {
    this.logger = logger;
  }

  requestDidStart(): GraphQLRequestListener {
    const logger = this.logger;
    const options = this.options;
    const flush = this.autoFlush;

    return {
      didResolveOperation({ request, operation, operationName }): void {
        if (request.query) {
          const entry: Omit<GraphQlLogEntry, 'context' | 'ts'> = {
            format: 'graphql',
            level: options.level,
            data: {
              query: request.query,
              variables: request.variables,
              operation:
                [operation?.operation, operationName].filter((v) => !!v).join(' ') || undefined,
            },
          };
          logger.add(entry);
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
