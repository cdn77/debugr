Console Log Handler for Debugr
=========================

This LogHandler adds logging to console.

## Installation

```bash
npm install --save @debugr/console-handler
```

## Usage

With standalone Apollo Server:

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
