import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { EntryType, LogLevel, PluginKind } from '@debugr/core';
import type { GraphqlQueryLogEntry } from '@debugr/graphql-common';
import type { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import type { ApolloCollectorOptions } from './types';

export class ApolloCollector<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements CollectorPlugin<TTaskContext, TGlobalContext>, ApolloServerPlugin
{
  public readonly id = 'apollo';
  public readonly kind = PluginKind.Collector;
  public readonly entryTypes = [EntryType.GraphqlQuery];

  private readonly level: LogLevel;
  private logger: Logger<TTaskContext, TGlobalContext>;

  public constructor(options?: ApolloCollectorOptions) {
    this.level = options?.level ?? LogLevel.INFO;
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public requestDidStart = async (): Promise<GraphQLRequestListener> => {
    const logger = this.logger;
    const level = this.level;

    return {
      didResolveOperation: async (ctx): Promise<void> => {
        const operation =
          [ctx.operation?.operation, ctx.operationName].filter((v) => !!v).join(' ') || undefined;

        operation && logger.setContextProperty('queryName', operation);

        if (ctx.request.query) {
          logger.add<GraphqlQueryLogEntry>({
            type: EntryType.GraphqlQuery,
            level,
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
