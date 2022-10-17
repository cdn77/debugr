import type { GraphqlQueryData } from './types';

export function getGraphqlOperation(data: GraphqlQueryData): string | undefined {
  return data.operation ?? (data.query.replace(/{[\s\S]*$/, '').trim() || undefined);
}
