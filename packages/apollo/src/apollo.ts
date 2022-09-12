import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { LogLevel } from '@debugr/core';
import type { GraphQLQueryLogEntry } from '@debugr/graphql-common';
import type { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import type { FullOptions, Options } from './types';

export class ApolloPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements CollectorPlugin<TTaskContext, TGlobalContext>, ApolloServerPlugin
{
  readonly id: string = 'apollo';

  readonly entryTypes: string[] = ['graphql.query'];

  private readonly options: FullOptions;

  private logger: Logger<TTaskContext, TGlobalContext>;

  constructor(options?: Options) {
    this.options = {
      level: options?.level ?? LogLevel.INFO,
      forceSubtask: options?.forceSubtask ?? false,
    };
  }

  injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public getApolloMiddleware() {
    return async (resolve: any): Promise<any> => {
      return this.logger.runTask(resolve, !this.options.forceSubtask);
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
          logger.add<GraphQLQueryLogEntry>({
            type: 'graphql.query',
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
          logger.error(err.originalError ?? err);
        }
      },
    };
  };
}
