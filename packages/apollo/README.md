Apollo Server plugin for Debugr
===============================

This plugin provides GraphQL query logging for Apollo Server.

## Installation

```bash
npm install --save @debugr/apollo
```

## Usage

Standalone Apollo Server:

```typescript
import { ApolloServer } from 'apollo-server';
import { Logger, LogLevel } from '@debugr/core';
import { ApolloLogger } from '@debugr/apollo';
import { ConsoleLogHandler } from '@debugr/console-handler';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new ConsoleLogHandler({
    threshold: LogLevel.INFO,
  }),
  new ApolloLogger(),
]);

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    logger.getPlugin('apollo'),
  ],
});
```

With Express integration and plugin:

```typescript
import { ApolloServer } from 'apollo-server-express';
import * as express from 'express';
import { Logger, LogLevel } from '@debugr/core';
import { ExpressLogger } from '@debugr/express';
import { ApolloLogger } from '@debugr/apollo';
import { ConsoleLogHandler } from '@debugr/console-handler';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new ConsoleLogHandler({
    threshold: LogLevel.INFO,
  }),
  new ExpressLogger(),
  new ApolloLogger(),
]);

const app = express();

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    debug.getPlugin('apollo'),
  ],
});

app.use(logger.getPlugin('express').createRequestHandler());

server.applyMiddleware({ app });

app.use(logger.getPlugin('express').createErrorHandler());

app.listen(8000);
```

### Options

The `ApolloLogger` constructor accepts an optional `options` object
with the following keys as the first argument:

| Option         | Type                 | Default         | Description                                                                                                          |
|----------------|----------------------|-----------------|----------------------------------------------------------------------------------------------------------------------|
| `level`        | `LogLevel`, `number` | `LogLevel.INFO` | The level at which GraphQL queries are logged.                                                                       |
| `forceSubtask` | `boolean`            | `false`         | Whether a subtask should be always started. By default, a subtask is only started if another task doesn't exist yet. |
