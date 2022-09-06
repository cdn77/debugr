Elastic Log Handler for Debugr
=========================

This LogHandler adds logging to Elastic via SDK.

## Installation

```bash
npm install --save @debugr/elastic-handler
```

## Usage

```typescript
import { Debugr, LogLevel } from '@debugr/core';
import { ElasticLogHandler } from '@debugr/elastic-handler';

const globalContext = {
  applicationName: 'example',
};

const debugr = Debugr.create(globalContext, 
  [
    ElasticLogHandler.create({
      index: 'example-app-logs',
    }),
  ],
);

debugr.logger.setContextProperty('jobName', 'elasticTest');

debugr.logger.info('Application started.');
// should send a new entry to the `example-app-logs` index with the following content:
// {
//   level: 30,
//   message: 'Application started.',
//   ts: '2022-09-04T12:13:14Z',
//   context: {
//     applicationName: 'example',
//     jobName: 'elasticTest',
//   },
// }
```

### Options

The `ElasticLogHandler.create()` factory, as well as the `ElasticLogHandler()` constructor,
accept a *required* `options` object as the first argument. The factory method creates
an instance of the `Client` class from the [`@elastic/elasticsearch`] SDK using the `options`
object, while the constructor accepts an already-configured `Client` instance as the second argument;
so for the factory method, the `options` object is a union of the log handler options and the `Client`
options. See the [`@elastic/elasticsearch`] package documentations for the available `Client` options.
The available log handler options are as follows:

| Option             | Type                                       | Default             | Description                                                                                                                                                                                                                                                                                                      |
|--------------------|--------------------------------------------|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `index`            | `string`, `(entry: LogEntry) => string`    | _(required)_        | The Elastic index to which entries will be sent. You can specify a callback to route each entry to a different index based e.g. on level.                                                                                                                                                                        |
| `threshold`        | `LogLevel`, `number`                       | `LogLevel.TRACE`    | The lowest level of entries which will be logged. Any entries below this level will be ignored.                                                                                                                                                                                                                  |
| `bodyMapper`       | `(entry: LogEntry) => Record<string, any>` | _(see description)_ | A callback transforming a `LogEntry` into the data object to be sent to Elastic. The default mapper will leave most of the entry data as-is, except the `globalContext` and `taskContext` objects which will be merged into a single `context` object, and the `data` object which will be serialized into JSON. |
| `errorCallback`    | `(error: Error) => void`                   | _(see description)_ | A callback which will be called when sending an entry to Elastic fails. The default callback will simply log the error into the console.                                                                                                                                                                         |
| `errorMsThreshold` | `number`                                   | _(none)_            | Minimum time since last call to `errorCallback` before calling it again.                                                                                                                                                                                                                                         |

[`@elastic/elasticsearch`]: https://www.npmjs.com/package/@elastic/elasticsearch
