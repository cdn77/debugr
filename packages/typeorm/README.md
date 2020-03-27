TypeORM plugin for Debugr
=========================

This plugin provides a `Logger` implementation compatible with TypeORM,
allowing you to add SQL logging to your tasks.

*IMPORTANT:* Due to the way logging and connection management in TypeORM work
you'll only be able to use this *inside transactions*. TypeORM only has a single
global logger instance; you can't specify a custom logger when running queries
from application code. This logger has access to the TypeORM `QueryRunner` instance
used to run the currently-logged query; but TypeORM internally manages a whole
pool of these and outside a transaction you can't ensure that a logical thread
of execution will reuse the same query runner. _Inside_ a transaction, however,
you are required to use the `EntityManager` instance allocated for that specific
transaction, and that, in turn, has its own `QueryRunner` for the whole duration
of the transaction. So using the `QueryRunner`'s `data` property we can sort of
inject the Debugr logger instance to somewhere the TypeORM logger can reach it.

All of this happens internally and you don't need to worry about it, but I think
it's important that you know the limitations.

## Installation

```bash
npm install --save @debugr/typeorm
```

## Usage

```typescript
import { debugr } from '@debugr/core';
import { typeormLogger, injectQueryLogger } from '@debugr/typeorm';
import { createConnection } from 'typeorm';

// initialise debugr as usual
const debug = debugr({
  logDir: __dirname + '/log',
  plugins: [
    typeormLogger(),
  ],
});

// inject the plugin into your TypeORM connection options
const connection = await createConnection({
  // ...
  logger: debug.getPlugin('typeorm'),
});

// get a logger instance for your task somehow
const logger = debug.createLogger();

await connection.transaction(async entityManager => {
  // inject the logger at the start of the transaction
  injectQueryLogger(entityManager, logger);

  // now all queries inside the transaction, up to
  // the COMMIT or ROLLBACK at the end, will be logged
});

// don't forget to flush the logger when your task is done
// if it isn't done automatically by e.g. the Express plugin!
logger.flush();
```
