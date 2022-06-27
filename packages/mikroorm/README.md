TypeORM plugin for Debugr
=========================

This plugin provides a `Logger` implementation compatible with TypeORM,
allowing you to add SQL logging to your tasks.

## Installation

```bash
npm install --save @debugr/typeorm
```

## Usage

```typescript
import { 
  Logger, 
  Debugr, 
  LogLevel,
} from '@debugr/core';
import { TypeormLogger } from '@debugr/typeorm';
import { ConsoleLogHandler } from '@debugr/console-handler';
import { SqlConsoleFormatter } from '@debugr/sql-console-formatter';
import { createConnection } from 'typeorm';

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
    TypeormLogger.create(),
    // Need to add formatter between TypeormLogger and ConsoleLogHandler
    SqlConsoleFormatter.create(),
  ],
);

// inject the plugin into your TypeORM connection options
const connection = await createConnection({
  // ...
  logger: debugr.getPlugin('typeorm'),
});
```
