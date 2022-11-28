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
import { ApolloCollector } from '@debugr/apollo';
import { ConsoleHandler } from '@debugr/console';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new ConsoleHandler({
    threshold: LogLevel.INFO,
  }),
  new ApolloCollector(),
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
import { ExpressCollector } from '@debugr/express';
import { ApolloCollector } from '@debugr/apollo';
import { ConsoleHandler } from '@debugr/console';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new ConsoleHandler({
    threshold: LogLevel.INFO,
  }),
  new ExpressCollector(),
  new ApolloCollector(),
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

The `ApolloCollector` constructor accepts an optional `options` object
with the following keys as the first argument:

| Option         | Type       | Default         | Description                                                                                                          |
|----------------|------------|-----------------|----------------------------------------------------------------------------------------------------------------------|
| `level`        | `LogLevel` | `LogLevel.INFO` | The level at which GraphQL queries are logged.                                                                       |
