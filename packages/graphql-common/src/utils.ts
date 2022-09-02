import type { GraphQLQueryData } from './types';

export function getGraphQLOperation(data: GraphQLQueryData): string | undefined {
  return data.operation ?? (data.query.replace(/{[\s\S]*$/, '').trim() || undefined);
}
