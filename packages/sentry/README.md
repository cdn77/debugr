Sentry Log Handler for Debugr
=========================

This LogHandler will forward errors to Sentry.

This plugin **does not** use the Sentry SDK, because it's incompatible with `AsyncLocalStorage`,
which Debugr makes heavy use of.

## Installation

```bash
npm install --save @debugr/sentry
```

## Usage

```typescript
import { Logger, LogLevel } from '@debugr/core';
import { SentryHandler } from '@debugr/sentry';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new SentryHandler({
    dsn: 'https://publickey@my.sentry.host/123',
  }),
]);

logger.setContextProperty('jobName', 'sentryTest');

logger.error(new Error('App crashed!'));

```

### Options

The `SentryHandler` constructor accepts an optional `options` object as the first argument.
The available options are:

| Option                | Type                          | Default             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-----------------------|-------------------------------|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `dsn`                 | `string`                      | _(none)_            | The Sentry DSN. If unspecified or empty, the handler will not do anything.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `breadcrumbThreshold` | `LogLevel`                    | `LogLevel.DEBUG`    | The minimum level for entries to be collected as breadcrumbs.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `captureThreshold`    | `LogLevel`                    | `LogLevel.ERROR`    | The minimum level at which entries should be captured and sent to Sentry. A captured entry will send all breadcrumbs collected within the same task prior to the entry being captured.                                                                                                                                                                                                                                                                                               |
| `captureProbability`  | `number`                      | `1`                 | The probability, as a float in the range `<0, 1>`, with which captured entries will be actually sent to Sentry. For example a value of `0.1` means 10% probability, so roughly 1 in every 10 captured entries will be sent.                                                                                                                                                                                                                                                          |
| `captureWholeTasks`   | `boolean`                     | `true`              | Whether to wait for a task to finish before sending captured entries to Sentry. If this is set to `true` (the default), only the last entry captured within a task will be sent, with all prior captured entries from the same task included in the breadcrumbs. When set to `false`, each entry captured within a task will be sent immediately, including all prior breadcrumbs, which could result in multiple separate entries in Sentry when an error is logged multiple times. |
| `extractMessage`      | `(entry: LogEntry) => string` | _(see description)_ | A callback which should extract a string message from a `LogEntry`. By default, if an error is part of the entry, its message is used; otherwise the entry message is used, if present; and finally a generic string is generated.                                                                                                                                                                                                                                                   |
| `levelMap`            | `Record<number, string>`      | _(none)_            | A map of custom log levels to Sentry log levels. Sentry recognises the following log levels: `debug`, `info`, `warning`, `error` and `fatal`.                                                                                                                                                                                                                                                                                                                                        |

[`@elastic/elasticsearch`]: https://www.npmjs.com/package/@elastic/elasticsearch
