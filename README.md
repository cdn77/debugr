Detailed Bug Reporter
=====================

This is a tool to simplify the debugging of task-oriented Node.js processes.

The core concept of this tool is that many common backend applications can be logically divided into
a number of tasks or pipelines - e.g. handling a single HTTP request, processing a batch of data
in a cron job etc. In an asynchronous environment, simply writing debug data to a log file from
parallel tasks quickly results in a headache. Apply a little Debugr magic though, and the next bug
that causes your app to crash will be found in minutes, if not seconds!

Also Debugr supports multiple log handlers into which are log events distributed and each of them handle
them by itself. Which you use is up to yourself, also you can add your own.

Heavily inspired by [Tracy], although Debugr comes with its own unique perks.
Written in TypeScript, so type declarations are included out of the box.

## Installation

Debugr consists of a core package and a number of plugins. `npm install` what you need according
to your use-case:

Core:

- [`@debugr/core`] - Boring, but necessary

Plugins:

- [`@debugr/apollo`] - Apollo Server request plugin
- [`@debugr/express`] - Express request & response plugin
- [`@debugr/insaner`] - Insaner plugin
- [`@debugr/typeorm`] - TypeORM SQL plugin

Log Handlers:

- [`@debugr/console-handler`] - Log Handler to console
- [`@debugr/elastic-handler`] - Log Handler to elastic
- [`@debugr/html-handler`] - Log Handler to html dumps
- [`@debugr/slack-handler`] - Log Handler to slack channel

Formatter Plugins:

- [`@debugr/graphql-console-formatter`] - GraphQL query console formatter
- [`@debugr/graphql-html-formatter`] - GraphQL query html formatter
- [`@debugr/http-console-formatter`] - HTTP request & response console formatter
- [`@debugr/http-html-formatter`] - HTTP request & response html formatter
- [`@debugr/sql-console-formatter`] - SQL query console formatter
- [`@debugr/sql-html-formatter`] - SQL query html formatter

Note that formatter plugins must be installed and configured manually and with logger getter are those dependencies checked and may cause thrown of error

## Usage introduction

This is an example of the raw core usage, just to show you the basics; with plugins a lot of the
stuff will be done automatically for you.

```typescript
import { 
  Logger, 
  Debugr, 
  PluginManager, 
  LogLevel,
} from '@debugr/core';
import { ConsoleLogHandler } from '@debugr/console-handler';
import { HtmlLogHandler } from '@debugr/html-handler';

const globalContext = {
  applicationName: 'example',
};

// Inject Plugin manager to log handlers, so they dont need plugin
// manager as dependency...

const debugr = Debugr.create(globalContext);

const consoleLogHandler = ConsoleLogHandler.create(
  debugr.pluginManager, 
  LogLevel.info,
);
const htmlLogHandler = HtmlLogHandler.create(
  debugr.pluginManager, 
  {
    threshold: LogLevel.trace,
    outputDir: './log',
    gc: {
      interval: 600,
      threshold: LogLevel.trace,
    },
  },
);

debugr.registerHandler(consoleLogHandler);
debugr.registerHandler(htmlLogHandler);


// There are all dependent formatters checked and validated. In this example there are none needed, because we did not install any plugins
const logger: Logger = debug.logger;

// ... but to make Debugr aware of the execution context of your task,
// you need to fork the logger at the beginning of the task:
logger.fork(() => {
  // execute your task here

  // At any point inside your task you can write into the logger:
  logger.debug('A debug message');
  logger.info('An info message with %d %s %s', [3, 'printf-style', 'params']);
  logger.warning({ custom: 'data', is: 'supported also' });
  logger.error(new Error('Which shan\'t disappear without a trace!'));
  logger.log(Logger.INFO, 'Just so you know');

  // At the end of your task you may call this for manual invocation logHandler.flush:
  logger.flush();
});
```

This will produce log to console and a dump file in the log directory that will look something like this:

![an example dump file]

### Wait, what the fork..?

Debugr internally uses an `AsyncLocalStorage` from the [Async Hooks] NodeJS module
which allows it to keep track of asynchronous execution without the need to explicitly
pass around a logger object. The `logger.fork()` method only generates a unique
identifier, stores it in the internal `AsyncLocalStorage` instance and then runs
the callback you provided, but inside that callback and any asynchronous calls made from
within it the logger can now retrieve the identifier and use it to figure out where
each message belongs.

### But how about code outside a forked job?

Outside a forked asynchronous execution context Debugr will still send logs to log handlers and it is on their own to manage it.
Console. Elastic and Slack handlers will log, but html handler ignores those logs.
This means that you can use Debugr everywhere in your
app and only worry about forking in a couple of places.

### Html log handler behaviour inside forked job

The way this tool is designed, **nothing** is logged at the time you call `logger.log()` or
any of the shortcuts; instead, when you call `logger.flush()`, Debugr will check if at least
one of the entries in the logger instance exceeded a (configurable) threshold. If there is
at least one such entry, the logger will be flushed into a uniquely-named file in the log
directory.

Of course, if you want a specific task logged *always*, you can do so: just call
`logger.markForWriting()` sometime between creating it and calling `logger.flush()`.
Conversely, if your code can determine that a particular task doesn't need to be logged
no matter how much things went wrong you can call `logger.markAsIgnored()`.

The format of the name of the files written in the log directory is `{timestamp}--{id}.html`.
`{timestamp}` is `YYYY-MM-DD-HH-II-SS` in UTC; `{id}` here represents an identifier
of the logger instance. By default, this identifier is generated from the log entry
which caused the logger to be marked for writing; in some scenarios you may want to set it
yourself, which you can do by means of `logger.setId()`.

Last but not least, if you should neglect to call `logger.flush()` at the end of your task,
Debugr will eventually realise something is amiss and flush the logger automatically,
provided the Node.js process didn't yet exit. This is called garbage collection and is,
of course, configurable.

Outside forked jobs all messages which exceed the threshold are logged to the console
immediately; there is no need to call `logger.flush()`.

### `debugr` options

| Option              | Type       | Default        | Description                                                                  |
| ------------------- | ---------- | -------------- | ---------------------------------------------------------------------------- |
| `global`            | `object`   |                | Options for global console logger (outside forked jobs)                      |
| `global.threshold`  | `number`   | `Logger.INFO`  | The minimum level a log entry must have to be written to the console         |
| `fork`              | `object`   |                | Options for forked job logger (the one that generates HTML dumps)            |
| `fork.logDir`       | `string`   |                | Root directory for generated logs; this is the only required option          |
| `fork.threshold`    | `number`   | `Logger.ERROR` | The minimum level a log entry must have to mark a job queue for writing      |
| `fork.cloneData`    | `boolean`  | `false`        | Clone data of log entries using V8 serialize / deserialize                   |
| `fork.gc`           | `object`   |                | Garbage collection options:                                                  |
| `fork.gc.interval`  | `number`   | `60`           | How often GC will be run, in seconds                                         |
| `fork.gc.threshold` | `number`   | `300`          | How long since a logger has last been touched before GC should auto-flush it |
| `plugins`           | `Plugin[]` |                | An array of plugins                                                          |

### `Logger` API

The `Logger` instance obtained from `debug.createLogger()` has the following methods:

 - `log(level: number, data: Record<string, any>): void`  
   `log(level: number, message: string, data?: Record<string, any>): void`  
   `log(level: number, message: string, params?: any[], data?: Record<string, any>): void`

   This method pushes an arbitrary entry onto the logger's queue. There are four default
   log levels: `Logger.DEBUG`, `Logger.INFO`, `Logger.WARNING` and `Logger.ERROR`. Later
   you'll learn how you can use your own arbitrary log levels.

   The `message` string can contain `printf`-style placeholders like `%s`, `%.3f` etc.
   These will be processed only if `params` is specified. Internally this uses [`printj`],
   so see its documentation to check what is possible.

   The `data` argument can contain any arbitrary data you wish to include in your dump.
   However: by default only a *reference* to the passed object is stored - meaning that
   the dump will contain a snapshot of the data at the moment `logger.flush()` is called.
   This should usually be okay; but if for some reason you need to you can turn on data
   cloning by setting the `cloneData` option to `true` when calling `debugr()`. If this
   option is set then the object passed to the `data` argument will be cloned using the
   V8 serialize / deserialize functions, which should be reasonably fast and supports
   complicated things like cyclic references and so on.

 - `debug(data: Record<string, any>): void`  
   `debug(message: string, data?: Record<string, any>): void`  
   `debug(message: string, params?: any[], data?: Record<string, any>): void`

   Shortcut for `logger.log(Logger.DEBUG, ...)`.

 - `info(data: Record<string, any>): void`  
   `info(message: string, data?: Record<string, any>): void`  
   `info(message: string, params?: any[], data?: Record<string, any>): void`

   Shortcut for `logger.log(Logger.INFO, ...)`.

 - `warning(data: Record<string, any>): void`  
   `warning(message: string, data?: Record<string, any>): void`  
   `warning(message: string, params?: any[], data?: Record<string, any>): void`

   Shortcut for `logger.log(Logger.WARNING, ...)`.

 - `error(data: Record<string, any>): void`  
   `error(message: string, data?: Record<string, any>): void`  
   `error(message: string, params?: any[], data?: Record<string, any>): void`

   Shortcut for `logger.log(Logger.ERROR, ...)`.

 - `setId(id: string): void`

   Sets the ID that will be used as part of the filename if the dump ends up
   getting written when `logger.flush()` is called.

 - `markForWriting(): void`

   Marks the logger for writing, i.e. when `logger.flush()` is called, the dump
   will be created regardless of whether an entry exceeding the threshold has
   been logged.

 - `markAsIgnored(): void`

   The inverse of `markForWriting()` - when `logger.flush()` is called, just
   forget the logger and don't write anything, no matter what has been logged.

 - `flush(): void`

   Writes the logger to the disk if an entry exceeding the threshold has been
   logged or if the logger has been marked for writing.


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
[`@debugr/express`]: ./packages/express
[`@debugr/apollo`]: ./packages/apollo
[`@debugr/typeorm`]: ./packages/typeorm
[`@debugr/http-formatter`]: ./packages/http-formatter
[`@debugr/sql-formatter`]: ./packages/sql-formatter
[`@debugr/graphql-formatter`]: ./packages/graphql-formatter
[`@debugr/log-handler`]: ./packages/log-handler
[an example dump file]: ./example.png
[Async Hooks]: https://nodejs.org/api/async_hooks.html
[`printj`]: https://www.npmjs.com/package/printj
