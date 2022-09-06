MikroORM plugin for Debugr
==========================

This plugin provides a `Logger` implementation compatible with MikroORM,
allowing you to add SQL logging to your tasks.

## Installation

```bash
npm install --save @debugr/mikroorm
```

## Usage

```typescript
import { Debugr, LogLevel } from '@debugr/core';
import { MikroORMLogger } from '@debugr/mikroorm';
import { ConsoleLogHandler } from '@debugr/console-handler';
import { MikroORM } from '@mikro-orm/core';

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
    MikroORMLogger.create(),
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

### Options

The `MikroORMLogger.create()` factory, as well as the `MikroORMLogger()` constructor,
accept an optional `options` object you can use to override the default mapping
between MikroORM logger namespaces and log levels on the one hand and Debugr log levels
on the other. MikroORM currently defines five logger namespaces and three log levels,
which are by default mapped to Debugr log levels as follows:

```typescript
const defaultNamespaceMap: MikroORMNamespaceMap = {
  discovery: LogLevel.DEBUG,
  info: LogLevel.INFO,
  query: LogLevel.INFO,
  'query-params': LogLevel.INFO,
  schema: LogLevel.INFO,
};

const defaultLevelMap: MikroORMLevelMap = {
  info: LogLevel.DEBUG,
  warning: LogLevel.WARNING,
  error: LogLevel.ERROR,
};
```

You can override any of these mappings using the optional `namespaces` and `levels`
keys of the `options` object.
