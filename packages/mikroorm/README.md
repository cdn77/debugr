MikroORM plugin for Debugr
=========================

This plugin provides a `Logger` implementation compatible with MikroORM,
allowing you to add SQL logging to your tasks.

## Installation

```bash
npm install --save @debugr/mikroorm
```

## Usage

```typescript
import { 
  Logger, 
  Debugr, 
  LogLevel,
} from '@debugr/core';
import { MikroORMLogger } from '@debugr/mikroorm';
import { ConsoleLogHandler } from '@debugr/console-handler';
import { SqlConsoleFormatter } from '@debugr/sql-console-formatter';
import { MikroORM } from '@mikro-orm/core';

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
    MikroORMLogger.create(),
    // Need to add formatter between MikroORMLogger and ConsoleLogHandler
    SqlConsoleFormatter.create(),
  ],
);

// inject the plugin into your MikroORM connection options
const connection = await MikroORM.init({
  // ...
  getLogger() {
    return debugr.getPlugin('mikroorm');
  },
});
```
