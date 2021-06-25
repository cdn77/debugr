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
import { debugr } from '@debugr/core';
import { typeormLogger } from '@debugr/typeorm';
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
```
