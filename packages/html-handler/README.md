Html Log Handler for Debugr
=========================

This LogHandler adds logging to html dumps

## Installation

```bash
npm install --save @debugr/html-handler
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
import { HtmlLogHandler } from '@debugr/html-handler';
import { GraphQLHtmlFormatter } from '@debugr/graphql-console-formatter';

const globalContext = {
  applicationName: 'example',
};

// There are all dependent formatters checked and validated.
const debugr = Debugr.create(globalContext, 
  [
    HtmlLogHandler.create(
      {
        threshold: LogLevel.TRACE,
        outputDir: './log',
        // optional arguments:
        // cloneData
      },
    ),
  ],
  [
    ApolloLogger.create(),
    // Need to add formatter between ApolloLogger and HtmlLogHandler
    GraphQLHtmlFormatter.create(),
  ],
);

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    debugr.getPlugin('apollo'),
  ],
});
```
