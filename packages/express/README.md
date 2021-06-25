Express plugin for Debugr
=========================

This plugin provides Debugr middleware for the Express web server.
With this middleware the Debugr logger will automatically be
forked for each HTTP request that Express handles; additionally
both the HTTP request and the response from your app will be logged
and the logger will be automatically flushed when the response is sent.
If the HTTP response code is >= 500 (or >= 400 if the `e4xx` option is set)
the response will be logged with the `Logger.ERROR` level, likely causing
the logger to be marked for writing and a dump file created.

## Installation

```bash
npm install --save @debugr/express
```

## Usage

```typescript
import { Logger, debugr } from '@debugr/core';
import { expressLogger } from '@debugr/express';
import * as express from 'express';

const debug = debugr({
  logDir: __dirname + '/log',
  plugins: [
    expressLogger(),
  ],
});

const app = express();

// as the very first middleware:
app.use(debug.getPlugin('express').createRequestHandler());

// apply your other middlewares like body parser and your routes

app.post('/my-api', function(req, res) {
  // in all your middlewares you can now access req.logger:
  req.logger.info('User id: %d', req.userId);

  // ...
});

// and then as the very last middleware:
app.use(debug.getPlugin('express').createErrorHandler());

app.listen(8000);
```

## Options

The `expressLogger()` function can take an object with the following
keys as the first argument:

| Option                    | Type       | Default                       | Description                                                                                             |
| ------------------------- | ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `level`                   | `number`   | `Logger.INFO`                 | The default level at which the request and response will be logged                                      |
| `e4xx`                    | `boolean`  | `false`                       | Consider HTTP 4xx status code as an error response and log appropriately                                |
| `captureBody`             |            |                               | See below; global setting for both request and response                                                 |
| `excludeHeaders`          | `string[]` |                               | Redact the contents of the specified headers when logging; global setting for both request and response |
| `request`                 | `object`   |                               | Request-specific logging options                                                                        |
| `request.captureBody`     |            |                               | See below; overrides global setting                                                                     |
| `request.excludeHeaders`  | `string[]` | `['Authorization', 'Cookie']` | Redact the contents of the specified headers when logging; overrides global setting                     |
| `response`                | `object`   |                               | Response-specific logging options                                                                       |
| `response.captureBody`    |            |                               | See below; overrides global setting                                                                     |
| `response.excludeHeaders` | `string[]` | `['Set-Cookie']`              | Redact the contents of the specified headers when logging; overrides global setting                     |

### `captureBody`

The `captureBody` option controls whether the request or response body
will be captured in the debug log. It can be set in many ways, so it bears
explaining in more detail:
 - A `boolean` simply means what `boolean` usually means - `captureBody: true`
   will capture the body *always*. This is usually slightly overkill. Typically
   you'll use this to *disable* capturing the raw request body if you're sure
   you don't ever care about it - e.g. if you log the decoded body by another plugin.
 - A `number` means "max size in bytes" - the body will be captured if its size
   is at most this value.
 - A (comma-separated) `string` or `string[]` means "content type". The body will
   be captured if it matches the given content type. You can use `*` as a simple
   placeholder for one or more characters, so you can use e.g. `text/*`.
 - An `object` with `string` keys and `number` values combines content type and
   content length conditions, so you can use e.g. `{ 'text/*': 2e6 }` to allow
   capturing any text body up to 2MB in size. Note that you can still use
   comma-separated types in the keys.

The default value for the `captureBody` option, for both request and response, is
`{ 'text/*, application/json': 2e6 }`. What this means for capturing a given
request or response body is left as an exercise for the reader.
