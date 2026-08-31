import type { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { LogLevel, PluginKind } from '@debugr/core';
import type { GraphqlQueryLogEntry } from '@debugr/graphql-common';
import type { ApolloCollectorOptions } from './types';

export class ApolloCollector<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>
  implements CollectorPlugin<TTaskContext, TGlobalContext>, ApolloServerPlugin
{
  public readonly id = 'apollo';
  public readonly kind = PluginKind.Collector;
  public readonly entryTypes = ['graphql.query'];

  private readonly options: ApolloCollectorOptions;
  private logger?: Logger<TTaskContext, TGlobalContext>;

  public constructor(options: ApolloCollectorOptions = {}) {
    this.options = options;
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public requestDidStart = async (): Promise<GraphQLRequestListener<any>> => {
    return {
      didResolveOperation: async (ctx): Promise<void> => {
        if (!this.logger) {
          return;
        }

        const operation =
          [ctx.operation?.operation, ctx.operationName].filter((v) => !!v).join(' ') || undefined;

        operation && this.logger.setContextProperty('queryName', operation);

        if (ctx.request.query) {
          this.logger.add<GraphqlQueryLogEntry>({
            type: 'graphql.query',
            level: this.options.level ?? LogLevel.INFO,
            data: {
              query: ctx.request.query,
              variables: ctx.request.variables,
              operation,
            },
          });
        }
      },
      didEncounterErrors: async ({ errors }): Promise<void> => {
        if (!this.logger) {
          return;
        }

        for (const err of errors) {
          this.logger.log(this.options.errorLevel ?? LogLevel.ERROR, err.originalError ?? err);
        }
      },
    };
  };
}
