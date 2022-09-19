Console Handler for Debugr
==============================

This Handler adds logging to console.

## Installation

```bash
npm install --save @debugr/console
```

## Usage

```typescript
import { Logger, LogLevel } from '@debugr/core';
import { ConsoleHandler } from '@debugr/console';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new ConsoleHandler(),
]);

logger.info('Application started.');

// will output something like:
// [ii] Application started.
```

### Options

The `ConsoleHandler` constructor accepts an optional `options` object
with the following keys as the first argument:

| Option      | Type                                       | Default         | Description                                                                                     |
|-------------|--------------------------------------------|-----------------|-------------------------------------------------------------------------------------------------|
| `threshold` | `LogLevel`, `number`                       | `LogLevel.INFO` | The lowest level of entries which will be logged. Any entries below this level will be ignored. |
| `levelMap`  | `Record<number, string>`                   |                 | A map of custom log levels to their string representation.                                      |
| `colorMap`  | `Record<number, (v: string) => string>`    |                 | A map of custom log levels to callbacks applying ANSI colors. See [`ansi-colors`].              |
| `timestamp` | `boolean`, `(ts: ImmutableDate) => string` | `false`         | Whether to prefix entries with their timestamp. Pass a callback if you need custom formatting.  |

[`ansi-colors`]: https://www.npmjs.com/package/ansi-colors
