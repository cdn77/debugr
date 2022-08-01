import { Logger, LogLevel, Plugin, TContextBase, TContextShape } from '@debugr/core';
import { GraphQlLogEntry } from '@debugr/graphql-common';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { FullOptions, Options } from './types';

export class ApolloPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements Plugin<TTaskContext, TGlobalContext>, ApolloServerPlugin
{
  readonly id: string = 'apollo';

  readonly entryFormat: 'graphql' = 'graphql';

  private readonly options: FullOptions;

  private logger: Logger<TTaskContext, TGlobalContext>;

  constructor(options?: Options) {
    this.options = {
      level: options?.level || LogLevel.INFO,
    };
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: Options,
  ): ApolloPlugin<TTaskContext, TGlobalContext> {
    return new ApolloPlugin<TTaskContext, TGlobalContext>(options);
  }

  injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public getApolloMiddleware() {
    return async (resolve: any): Promise<any> => {
      return this.logger.runTask(resolve, true);
    };
  }

  public requestDidStart = async (): Promise<GraphQLRequestListener> => {
    const logger = this.logger;
    const options = this.options;

    return {
      didResolveOperation: async (ctx): Promise<void> => {
        const operation =
          [ctx.operation?.operation, ctx.operationName].filter((v) => !!v).join(' ') || undefined;

        operation && logger.setContextProperty('queryName', operation);

        if (ctx.request.query) {
          logger.add<GraphQlLogEntry>({
            format: this.entryFormat,
            level: options.level,
            data: {
              query: ctx.request.query,
              variables: ctx.request.variables,
              operation,
            },
          });
        }
      },
      didEncounterErrors: async ({ errors }): Promise<void> => {
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
    };
  };
}
