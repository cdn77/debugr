Apollo Server plugin for Debugr
===============================

This plugin provides GraphQL request logging for Apollo Server.

## Installation

```bash
npm install --save @debugr/apollo
```

## Usage

Standalone Apollo Server:

```typescript
import { ApolloServer } from 'apollo-server';
import { Debugr, LogLevel } from '@debugr/core';
import { ApolloLogger } from '@debugr/apollo';
import { ConsoleLogHandler } from '@debugr/console-handler';

const globalContext = {
  applicationName: 'example',
};

const debugr = Debugr.create(globalContext, 
  [
    ConsoleLogHandler.create(
      LogLevel.INFO,
    ),
  ],
  [
    ApolloLogger.create(),
  ],
);

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    debugr.getPlugin('apollo'),
  ],
});
```

With Express integration and plugin:

```typescript
import { ApolloServer } from 'apollo-server-express';
import * as express from 'express';
import { Debugr, LogLevel } from '@debugr/core';
import { ExpressLogger } from '@debugr/express';
import { ApolloLogger } from '@debugr/apollo';
import { ConsoleLogHandler } from '@debugr/console-handler';

const globalContext = {
  applicationName: 'example',
};

const debugr = Debugr.create(globalContext, 
  [
    ConsoleLogHandler.create({
      threshold: LogLevel.INFO,
    }),
  ],
  [
    ExpressLogger.create(),
    ApolloLogger.create(),
  ],
);

const app = express();

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    debug.getPlugin('apollo'),
  ],
});

app.use(debugr.getPlugin('express').createRequestHandler());

server.applyMiddleware({ app });

app.use(debugr.getPlugin('express').createErrorHandler());

app.listen(8000);
```

### Options

The `ApolloLogger.create()` factory, as well as the `ApolloLogger()` constructor,
accept an optional `options` object with the following keys as the first argument:

| Option         | Type                 | Default         | Description                                                                                                          |
|----------------|----------------------|-----------------|----------------------------------------------------------------------------------------------------------------------|
| `level`        | `LogLevel`, `number` | `LogLevel.INFO` | The level at which GraphQL requests are logged.                                                                      |
| `forceSubtask` | `boolean`            | `false`         | Whether a subtask should be always started. By default, a subtask is only started if another task doesn't exist yet. |
