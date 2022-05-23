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
import { ApolloLogger } from '@debugr/apollo';
import { ApolloServer } from 'apollo-server';
import { 
  Logger, 
  Debugr, 
  LogLevel,
} from '@debugr/core';
import { ConsoleLogHandler } from '@debugr/console-handler';
import { GraphQLConsoleFormatter } from '@debugr/graphql-console-formatter';

const globalContext = {
  applicationName: 'example',
};

// There are all dependent formatters checked and validated.
const debugr = Debugr.create(globalContext, 
  [
    ConsoleLogHandler.create(
      LogLevel.info,
    ),
  ],
  [
    ApolloLogger.create(),
    // Need to add formatter between ApolloLogger and ConsoleLogHandler
    GraphQLConsoleFormatter.create(),
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
import { ExpressLogger } from '@debugr/express';
import { ApolloServer } from 'apollo-server-express';
import * as express from 'express';
import { 
  Logger, 
  Debugr, 
  LogLevel,
} from '@debugr/core';
import { ConsoleLogHandler } from '@debugr/console-handler';
import { GraphQLConsoleFormatter } from '@debugr/graphql-console-formatter';
import { HttpConsoleFormatter } from '@debugr/http-console-formatter';

const globalContext = {
  applicationName: 'example',
};

// There are all dependent formatters checked and validated.
const debugr = Debugr.create(globalContext, 
  [
    ConsoleLogHandler.create(
      LogLevel.info,
    ),
  ],
  [
    ApolloLogger.create(),
    ExpressLogger.create(),
    // Need to add formatter between ApolloLogger and ConsoleLogHandler
    GraphQLConsoleFormatter.create(),
    // Need to add formatter between ExpressLogger and ConsoleLogHandler
    HttpConsoleFormatter.create(),
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
