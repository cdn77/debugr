Detailed Bug Reporter
=====================

The Detailed Bug Reporter, a.k.a. Debugr, is a tool you can use to improve logging in your Node.js applications.

The core concept of this tool is that many common backend applications can be logically divided into
a number of tasks or pipelines - e.g. handling a single HTTP request, processing a batch of data
in a cron job etc. In an asynchronous environment, simply writing debug data to a log file from
parallel tasks quickly results in a headache. Apply a little Debugr magic though, and the next bug
that causes your app to crash will be found in minutes, if not seconds!

Debugr comes with several integrations out of the box, both for collecting log data and for persisting logs
into storage. It's trivial to add your own integrations though, if you need something custom!

Heavily inspired by [Tracy], although Debugr comes with its own unique perks.
Written in TypeScript, so type declarations are included out of the box.

## Installation

Debugr consists of a core package and a number of plugins. `npm install` what you need according
to your use-case:

### Core:

 - [`@debugr/core`] - Boring, but necessary

### Log Handlers:

Log Handlers are responsible for deciding what to do with log entries. The `Logger` class
in Debugr doesn't write the log entries anywhere by itself - it delegates this work to configured
Log Handlers.

- [`@debugr/console-handler`] - Outputs formatted entries to console
- [`@debugr/elastic-handler`] - Sends structured entries to an Elastic index
- [`@debugr/html-handler`] - Creates Tracy-style HTML dump files
- [`@debugr/slack-handler`] - Sends messages to a Slack channel

### Plugins:

There are several plugins which bridge Debugr with various popular frameworks and libraries.
Their main responsibility is collecting loggable data from the framework and converting it to
a format which Debugr can process downstream.

 - [`@debugr/apollo`] - Apollo GraphQL server plugin
 - [`@debugr/express`] - Express HTTP server plugin
 - [`@debugr/insaner`] - Insaner HTTP server plugin
 - [`@debugr/mikroorm`] - MikroORM plugin

## Usage introduction

This is an example of the raw core usage, just to show you the basics; with plugins a lot of the
stuff will be done automatically for you.

```typescript
import { Logger, LogLevel } from '@debugr/core';
import { ConsoleLogHandler } from '@debugr/console-handler';
import { HtmlLogHandler } from '@debugr/html-handler';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new ConsoleLogHandler({
    threshold: LogLevel.INFO
  }),
  new HtmlLogHandler({
    threshold: LogLevel.ERROR,
    outputDir: __dirname + '/log',
  }),
]);

// Wrap anything you consider a "task" in a callback and pass that callback
// to `logger.runTask()` like this:
logger.runTask(async () => {
  // execute your task here

  // At any point inside the task you can write into the logger:
  logger.debug('A debug message');
  logger.info(['An info message with %d %s %s', 3, 'printf-style', 'params']);
  logger.warning({ custom: 'data', is: 'supported also' });
  logger.error(new Error('Which shan\'t disappear without a trace!'));
  logger.log(Logger.INFO, 'Just so you know');
});
```

This will produce log to console and a dump file in the log directory that will look something like this:

![an example dump file]

### Wait, what the runTask..?

Debugr internally uses an `AsyncLocalStorage` from the [Async Hooks] NodeJS module
which allows it to keep track of asynchronous execution without the need to explicitly
pass around a logger object. So you can just inject the `Logger` instance anywhere you need,
and it will _magically_ know which task each log entry belongs to. Tasks can of course also
be nested, which may help when debugging - you can filter the logs by task to only see
entries relevant to the issue you're hunting for.

### But how about logging outside a task?

Outside a task Debugr will still send logs to log handlers, and it's up to them to decide
what to do. The Console, Elastic and Slack handlers will log those entries as usual;
the HTML handler will ignore them. This means that you can use Debugr everywhere in your
app and only worry about encapsulating tasks with callbacks in a couple of places.

### HTML Log Handler behaviour inside tasks

The HTML handler is special in that it doesn't log immediately, but instead keeps all
entries in an internal queue. When a task ends, the HTML handler will check if the task's queue
contains at least one entry which matches or exceeds the configured threshold. If no such entry
is found, the entire queue is silently discarded; if at least one matching entry exists,
the whole queue is formatted into a timestamped HTML dump file in the configured log directory.
The filename also contains a hash derived from the first entry which matched the configured threshold;
this hash can often be used to find identical or similar errors.

### Context

There are two types of _context objects_ in Debugr: the global context object you pass as the first
argument to `new Logger()`, and the task-specific context which gets created automatically when each task
is started. The context objects are available to log handlers as part of each log entry; the log handlers
can choose to use the data in those objects any way they want. Currently, the only handler which makes use
of the context data is the Elastic handler, which includes both context objects in each entry it sends to Elastic.
The intended use for this is to e.g. include the worker process ID, hostname and similar metadata valid for
the entire lifetime of the process in the global context and basic request metadata / cron job name etc. in
the task context, so that you have.. well.. _context_ when looking at log entries in Elastic.

### `Logger` API

The `Logger` instance has the following methods:

 - `log(level: number, data: Record<string, any> | Error): void`  
   `log(level: number, message: string | [string, ...any], data?: Record<string, any>): void`  
   `log(level: number, message: string | [string, ...any], error: Error, additionalData?: Record<string, any>): void`  

   This method pushes an arbitrary entry onto the logger's queue. There are six default
   log levels: `LogLevel.TRACE`, `LogLevel.DEBUG`, `LogLevel.INFO`, `LogLevel.WARNING`, `LogLevel.ERROR`
   and `LogLevel.FATAL`. Later you'll learn how you can use your own arbitrary log levels.

   The `message` can either be just a string, or a `[string, ...any]` tuple; the latter is processed
   as a `printf`-style format string using the rest of the tuple as parameters. Internally this is
   facilitated by [`printj`], so take a look at their documentation to see what's possible.

   The `data` argument can contain any arbitrary data you wish to include in your dump.

 - `trace(data: Record<string, any> | Error): void`  
   `trace(message: string | [string, ...any], data?: Record<string, any> | Error): void`  
   `trace(message: string | [string, ...any], error: Error, additionalData?: Record<string, any>): void`  

   Shortcut for `logger.log(Logger.TRACE, ...)`.

 - `debug(data: Record<string, any> | Error): void`  
   `debug(message: string | [string, ...any], data?: Record<string, any> | Error): void`  
   `debug(message: string | [string, ...any], error: Error, additionalData?: Record<string, any>): void`  

   Shortcut for `logger.log(Logger.DEBUG, ...)`.

 - `info(data: Record<string, any> | Error): void`  
   `info(message: string | [string, ...any], data?: Record<string, any> | Error): void`  
   `info(message: string | [string, ...any], error: Error, additionalData?: Record<string, any>): void`

   Shortcut for `logger.log(Logger.INFO, ...)`.

 - `warning(data: Record<string, any> | Error): void`  
   `warning(message: string | [string, ...any], data?: Record<string, any> | Error): void`  
   `warning(message: string | [string, ...any], error: Error, additionalData?: Record<string, any>): void`

   Shortcut for `logger.log(Logger.WARNING, ...)`.

 - `error(data: Record<string, any> | Error): void`  
   `error(message: string | [string, ...any], data?: Record<string, any> | Error): void`  
   `error(message: string | [string, ...any], error: Error, additionalData?: Record<string, any>): void`

   Shortcut for `logger.log(Logger.ERROR, ...)`.

 - `fatal(data: Record<string, any> | Error): void`  
   `fatal(message: string | [string, ...any], data?: Record<string, any> | Error): void`  
   `fatal(message: string | [string, ...any], error: Error, additionalData?: Record<string, any>): void`  

   Shortcut for `logger.log(Logger.FATAL, ...)`.

 - `setContextProperty<T extends keyof TTaskContext>(key: T, value: NonNullable<TTaskContext>[T]): Logger<TTaskContext, TGlobalContext>`

   Sets a property on the current task context, if one exists.

## Development

To release a new version of a package, run the following command in the package
directory:

```bash
npm --no-git-tag-version --force version <major|minor|patch>
```

Next, commit your changes and push the new commits to the repository;
any packages with updated version in `package.json` will be automatically
published to NPM.

[Tracy]: https://tracy.nette.org
[`@debugr/core`]: ./packages/core
[`@debugr/console-handler`]: ./packages/console-handler
[`@debugr/elastic-handler`]: ./packages/elastic-handler
[`@debugr/html-handler`]: ./packages/html-handler
[`@debugr/slack-handler`]: ./packages/slack-handler
[`@debugr/apollo`]: ./packages/apollo
[`@debugr/express`]: ./packages/express
[`@debugr/insaner`]: ./packages/insaner
[`@debugr/mikroorm`]: ./packages/mikroorm
[an example dump file]: ./example.png
[Async Hooks]: https://nodejs.org/api/async_hooks.html
[`printj`]: https://www.npmjs.com/package/printj
