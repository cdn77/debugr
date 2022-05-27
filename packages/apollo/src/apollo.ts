import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { Logger, Plugin, LogLevel, TContextBase, TContextShape } from '@debugr/core';
import { FullOptions, GraphQlLogEntry, Options } from './types';

export class ApolloLogger<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements Plugin<Partial<TTaskContext>, TGlobalContext>, ApolloServerPlugin
{
  readonly id: string = 'apollo';

  readonly entryFormat: 'graphql' = 'graphql';

  private readonly options: FullOptions;

  private logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  constructor(options?: Options) {
    this.options = {
      level: options?.level || LogLevel.INFO,
    };
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: Options,
  ): ApolloLogger<Partial<TTaskContext>, TGlobalContext> {
    return new ApolloLogger<Partial<TTaskContext>, TGlobalContext>(options);
  }

  injectLogger(logger: Logger<Partial<TTaskContext>, TGlobalContext>): void {
    this.logger = logger;
  }

  public getApolloMiddleware() {
    return async (resolve: any, root: any, args: any, context: any, info: any): Promise<any> => {
      this.logger.runTask(() => {
        let queryOrMutationName = 'unknown';
        const operationNames = info.operation.selectionSet.selections.map(
          (item: any) => item?.name?.value,
        );

        if (operationNames.length === 1) {
          queryOrMutationName = `${operationNames[0]}`;
        } else if (operationNames.length > 1) {
          queryOrMutationName = JSON.stringify(operationNames);
        }

        this.logger.setContextProperty('queryName', queryOrMutationName).add({
          level: this.options.level,
          message: 'Graphql request initiated',
          data: args,
        });
      });
    };
  }

  public requestDidStart = async (): Promise<GraphQLRequestListener> => {
    const logger = this.logger;
    const options = this.options;

    return {
      didResolveOperation: async ({ request, operation, operationName }): Promise<void> => {
        if (request.query) {
          const entry: Omit<GraphQlLogEntry, 'context' | 'ts'> = {
            format: 'graphql',
            level: options.level,
            message: 'GraphQL request',
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
