Common GraphQL interfaces and utilities
=======================================

This package defines the shape of the `data` included in entries which
represent a GraphQL query. Plugins which produce or consume such entries
should conform to this shape. Unless you're developing a Debugr plugin
or log handler, you usually don't need to worry about this package, as it will
be installed and used automatically when required.

## For plugin developers

The package exports the following type definitions:

```typescript
export interface GraphQLQueryData {
  query: string;                   // the complete GraphQL query as a string
  variables?: Record<string, any>; // any variables passed along with the request
  operation?: string;              // the extracted operation name, e.g. 'query getAllUsers'
}

export interface GraphQLQueryLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  type: 'graphql.query';
  data: GraphQLQueryData;
}
```

There is also a utility function called `getGraphQLOperation()` which attempts
to extract the GraphQL operation from the `GraphQLQueryData` object, either
by returning its `operation` property if it's nonempty, or by extracting the start
of the GraphQL query until the first `{` character.
