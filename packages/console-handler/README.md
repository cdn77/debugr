Console Log Handler for Debugr
==============================

This LogHandler adds logging to console.

## Installation

```bash
npm install --save @debugr/console-handler
```

## Usage

```typescript
import { Logger, LogLevel } from '@debugr/core';
import { ConsoleLogHandler } from '@debugr/console-handler';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new ConsoleLogHandler(),
]);

logger.info('Application started.');

// will output something like:
// [info] Application started.
```

### Options

The `ConsoleLogHandler` constructor accepts an optional `options` object
with the following keys as the first argument:

| Option           | Type                                    | Default         | Description                                                                                     |
|------------------|-----------------------------------------|-----------------|-------------------------------------------------------------------------------------------------|
| `threshold`      | `LogLevel`, `number`                    | `LogLevel.INFO` | The lowest level of entries which will be logged. Any entries below this level will be ignored. |
| `levelMap`       | `Record<number, string>`                |                 | A map of custom log levels to their string representation.                                      |
| `colorMap`       | `Record<number, (v: string) => string>` |                 | A map of custom log levels to callbacks applying ANSI colors. See [`ansi-colors`].              |
| `writeTimestamp` | `boolean`                               | `false`         | Prefixes the first line of each entry with the entry timestamp.                                 |

[`ansi-colors`]: https://www.npmjs.com/package/ansi-colors
