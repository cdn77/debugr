Html Log Handler for Debugr
=========================

This LogHandler will create interactive HTML dump files for each top-level task
which contains at least one entry at or above a configured threshold.

## Installation

```bash
npm install --save @debugr/html-handler
```

## Usage

```typescript
import { Logger, LogLevel } from '@debugr/core';
import { HtmlLogHandler } from '@debugr/html-handler';

const globalContext = {
  applicationName: 'example',
};

const logger = new Logger(globalContext, [
  new HtmlLogHandler({
    outputDir: './log',
  }),
]);

logger.runTask(async () => {
  logger.info('Task started.');
  
  await someWorkBeingDone();
  
  logger.info('Work has been done.');
  
  await moreBoringThingsHappeningInTheBackground();
  
  logger.info('Now it looks as though we\'re finally finished.');
});
```

### How it works

When a task is started, the log handler will create an internal queue for that task.
Each time a log entry is added, the handler will check if the entry exceeds the configured
threshold, and if it does, the entire queue for the current task is marked to be written
upon completion. So tasks which don't produce any log entries above the configured threshold
will not create a dump file - e.g. HTTP requests which complete successfully. But if even
a single entry exceeds the threshold, the _entire_ log for the task will be written, so that
you can debug step by step.

This works even with subtasks - if you e.g. separate the authentication step of a request
handler into a subtask, and you log an entry during the subtask which would exceed the threshold,
a dump will be created and the entire task tree for the request will be included. Notably, though,
each task can have its threshold set independently. Initially each task inherits its threshold
from its parent task, with the root task getting its threshold from the log handler options.
During the execution of a subtask you can get the log handler instance from the `Logger` instance
using the `logger.getHandler('html')` method, and then you can use that instance to set options
for the current task - change its threshold or force it to generate or to not generate a dump file
regardless of whether there is an entry which exceeds the threshold.

### Options

The `HtmlLogHandler` constructor accepts an `options` object as the first or second argument,
depending on whether you wish to pass a preconfigured `HtmlWriter` instance. The default `HtmlFileWriter`
simply writes the dump files into a configured directory, but you can get fancy with your own implementation,
e.g. sending the files to a central API.

| Option      | Type                     | Default          | Description                                                                                                                                    |
|-------------|--------------------------|------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `outputDir` | `string`                 |                  | The directory where dump files will be written. Will be created if nonexistent. **Required** if a `HtmlWriter` instance is not provided.       |
| `threshold` | `LogLevel`, `number`     | `LogLevel.ERROR` | The default threshold which needs to be reached or exceeded in order for a dump file to be generated.                                          |
| `cloneData` | `boolean`                | `false`          | Whether to take a snapshot of each log entry data as soon as it is logged. Use this to prevent log data from being mutated after being logged. |
| `levelMap`  | `Record<number, string>` |                  | A map of custom log levels to their string representation.                                                                                     |
| `colorMap`  | `Record<number, string>` |                  | A map of custom log levels to a CSS color which should be used in the generated dumps.                                                         |

### API

The `HtmlLogHandler` class has a couple of interesting methods mentioned above which you can use
to influence whether a dump file will be generated for a particular task. Here they are:

 - `handler.setThreshold(threshold: number): void` - This method can change the level at or above which
   a log entry needs to be in order for a dump file to be generated. Note that it doesn't work retroactively -
   an entry is compared against the threshold at the time it is logged, so if you increase the threshold after
   an entry already exceeded the original threshold, the dump file will still be generated; and similarly,
   if you decrease the threshold, previous entries above the new threshold but below the original will not cause
   a dump file to be generated.
 - `handler.markTaskForWriting(force: boolean = false): void` - This method can be used to tell the handler that
   the current task should generate a dump file, even if no entry matches or exceeds the task's threshold.
   With the `force` argument omitted or `false` the method will only have effect if the task wasn't yet flagged
   either way - that is, if no entry has yet matched or exceeded the task's threshold and neither
   `handler.markTaskForWriting()` nor `handler.markTaskIgnored()` have been called. With `force` set to `true`
   the task will generate a dump file, no questions asked.
 - `handler.markTaskIgnored(force: boolean = false): void` - This method does the opposite of `handler.markTaskForWriting()` -
   it tells the log handler that regardless of any entries which may reach or exceed the task's threshold the task
   should not generate a dump file. The `force` argument behaves just as it does in `handler.markTaskForWriting()`.
   Note that due to the fact that any single task which is marked for writing will cause the entire task tree
   to be written these two methods don't have the _exact_ same effect - meaning that when you call
   `handler.markTaskForWriting()` (especially with `force` set to `true`), you can be _sure_ that a dump file will be
   generated, whereas even if you call `handler.markTaskIgnored()` (even with `force` set to `true`), there's no
   guarantee that a different task won't cause a dump file to be generated. It seems logical and desirable from
   my perspective, but maybe it doesn't from yours, so I thought I'd elaborate.
