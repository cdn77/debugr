Insaner plugin for Debugr
=========================

This plugin provides Debugr middleware for the Insaner web server.
With this middleware a new task will automatically be started for each
HTTP request that Insaner handles; additionally, both the HTTP request and
the HTTP response or any error which reaches Insaner error handling
will be automatically logged. If the HTTP response code is >= 500
(or >= 400 if the `e4xx` option is set) the response will be logged
with the configured error level.


## Installation

```bash
npm install --save @debugr/insaner
```

## Usage

```typescript
import { InsanerCollector } from '@debugr/insaner';
import { HttpServer, HttpRequest, HttpForbiddenError } from 'insaner';
import { Logger, LogLevel } from '@debugr/core';
import { ConsoleHandler } from '@debugr/console';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new ConsoleHandler({
    threshold: LogLevel.INFO,
  }),
  new InsanerCollector(),
]);

const server = new HttpServer();

// allow the plugin to hook into the HTTP server
logger.getPlugin('insaner').install(server);

// apply your routes etc
server.router.post('/my-api', function(req, res) {
  // ...
});

server.listen(8000);
```

## Options

The `InsanerCollector` constructor accepts an optional `options` object
with the following keys as the first argument:

| Option                    | Type       | Default                       | Description                                                                                             |
|---------------------------|------------|-------------------------------|---------------------------------------------------------------------------------------------------------|
| `level`                   | `LogLevel` | `Logger.INFO`                 | The level at which the request and response will be logged                                              |
| `errorLevel`              | `LogLevel` | `Logger.ERROR`                | The level at which error responses will be logged                                                       |
| `uncaughtLevel`           | `LogLevel` | `options.errorLevel`          | The level at which uncaught errors which reach Insaner will be logged                                   |
| `e4xx`                    | `boolean`  | `false`                       | Consider HTTP 4xx status code as an error response and log appropriately                                |
| `excludeHeaders`          | `string[]` |                               | Redact the contents of the specified headers when logging; global setting for both request and response |
| `request`                 | `object`   |                               | Request-specific logging options                                                                        |
| `request.excludeHeaders`  | `string[]` | `['Authorization', 'Cookie']` | Redact the contents of the specified headers when logging; overrides global setting                     |
| `response`                | `object`   |                               | Response-specific logging options                                                                       |
| `response.excludeHeaders` | `string[]` | `['Set-Cookie']`              | Redact the contents of the specified headers when logging; overrides global setting                     |
