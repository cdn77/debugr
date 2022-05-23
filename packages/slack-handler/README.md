Slack Log Handler for Debugr
=========================

This LogHandler adds logging to slack channel.

## Installation

```bash
npm install --save @debugr/slack-handler
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
import { SlackLogHandler } from '@debugr/slack-handler';
import { GraphQLConsoleFormatter } from '@debugr/graphql-console-formatter';

const globalContext = {
  applicationName: 'example',
};

// There are all dependent formatters checked and validated.
const debugr = Debugr.create(globalContext, 
  [
    SlackLogHandler.create(
      {
        threshold: LogLevel.Fatal,
        webhookUrl: 'your slack webhook url',
      },
    ),
  ],
  [
    ApolloLogger.create(),
    // No formatters are needed for SlackLogHandler
  ],
);

const server = new ApolloServer({
  // typeDefs, resolvers, ...
  plugins: [
    debugr.getPlugin('apollo'),
  ],
});
```
