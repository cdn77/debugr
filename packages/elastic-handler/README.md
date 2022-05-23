Elastic Log Handler for Debugr
=========================

This LogHandler adds logging to elastic via sdk.

## Installation

```bash
npm install --save @debugr/elastic-handler
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
import { ElasticLogHandler } from '@debugr/elastic-handler';

const globalContext = {
  applicationName: 'example',
};

// There are all dependent formatters checked and validated.
const debugr = Debugr.create(globalContext, 
  [
    ElasticLogHandler.create(
      {
        threshold: LogLevel.TRACE,
        index: 'stringOrFunction',
        // optional arguments:
        // errorCallback
        // bodyMapper
        // errorMsThreshold
      },
    ),
  ],
  [
    ApolloLogger.create(),
    // No formatters are needed for ElasticLogHandler
  ],
);

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    debugr.getPlugin('apollo'),
  ],
});
```
