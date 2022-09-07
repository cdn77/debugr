Common SQL interfaces and utilities
===================================

This package defines the shape of the `data` included in entries which
represent an SQL query. Plugins which produce or consume such entries
should conform to this shape. Unless you're developing a Debugr plugin
or log handler, you usually don't need to worry about this package, as it will
be installed and used automatically when required.

## For plugin developers

The package exports the following type definitions:

```typescript
export interface SqlQueryData {
  query: string;         // The SQL query
  parameters?: any[];    // Any parameters passed to the SQL query
  error?: string;        // Any error message produced by the query
  stack?: string;        // Stack trace for the call which issued a query
  affectedRows?: number; // The number of rows affected by a DML query
  rows?: number;         // The number of rows selected by a DQL query
  time?: number;         // The time the query took to execute
}

export interface SqlQueryLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
  > extends LogEntry<TTaskContext, TGlobalContext> {
  type: 'sql.query';
  data: SqlQueryData;
}
```

There are also a couple of utility functions exported:

 - `formatQueryTime(ms: number, html: boolean = false): string` - This function formats the duration of an SQL query
   as a fraction of seconds if the duration was over 1000ms, or as milliseconds if the duration was lower, with the
   numeric part optionally wrapped in a HTML `<strong>` tag when `html` is set to `true`. For example: `35.753241`
   would result in `35.75 ms` or `<strong>35.75</strong> ms` and `5645.6768576` would result in `5.64 s` or
   `<strong>5.64</strong> s`.
 - `createQueryFormatter(): (query: string) => string` - This function attempts to load the `@sqltools/formatter`
   package and returns a preconfigured callback which converts reserved words to uppercase and inserts some strategic
   newlines to make the query easier to read; if the package isn't installed, it simply returns a noop callback which
   just returns the passed query as-is.
