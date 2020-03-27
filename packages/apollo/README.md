Apollo Server plugin for Debugr
===============================

This plugin provides GraphQL request logging for Apollo Server.
It either reuses an existing logger instance from the request context
or creates a new one and attaches it back to the context; either way
you'll have a logger instance available in resolvers and middlewares.
If the logger instance is created by this plugin then it is also
flushed when the response is sent.

## Installation

```bash
npm install --save @debugr/apollo
```

## Usage

Standalone Apollo Server:

```typescript
import { debugr } from '@debugr/core';
import { apolloLogger } from '@debugr/apollo';
import { ApolloServer } from 'apollo-server';

const debug = debugr({
  logDir: __dirname + '/log',
  plugins: [
    apolloLogger(),
  ],
});

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    debug.getPlugin('apollo'),
  ],
});
```

With Express integration and plugin:

```typescript
import { debugr } from '@debugr/core';
import { expressLogger } from '@debugr/express';
import { apolloLogger } from '@debugr/apollo';
import { ApolloServer } from 'apollo-server-express';
import * as express from 'express';

const debug = debugr({
  logDir: __dirname + '/log',
  plugins: [
    expressLogger(),
    apolloLogger(),
  ],
});

const app = express();

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    debug.getPlugin('apollo'),
  ],

  // in your context factory reattach the request logger
  // to the GraphQL context to reuse it
  context: (request: express.Request) => {
    return {
      logger: request.logger,
    };
  },
});

app.use(debugr.getPlugin('express').createRequestHandler());

server.applyMiddleware({ app });

app.use(debugr.getPlugin('express').createErrorHandler());

app.listen(8000);
```
