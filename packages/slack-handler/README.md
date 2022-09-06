Slack Log Handler for Debugr
=========================

This log handler will send each entry with a log level at or above a configured threshold
as a message to a configured Slack channel.

## Installation

```bash
npm install --save @debugr/slack-handler
```

## Usage

```typescript
import { Debugr, LogLevel } from '@debugr/core';
import { SlackLogHandler } from '@debugr/slack-handler';

const globalContext = {
  applicationName: 'example',
};

const debugr = Debugr.create(globalContext, 
  [
    SlackLogHandler.create({
      threshold: LogLevel.FATAL,
      webhookUrl: 'your slack webhook url',
    }),
  ],
);

debugr.logger.fatal('Something failed miserably!');
```

The `SlackLogHandler.create()` factory, as well as the `SlackLogHandler()` constructor,
accept a *required* `options` object with the following keys as the first argument:

| Option          | Type                                       | Default             | Description                                                                                                                                                       |
|-----------------|--------------------------------------------|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `webhookUrl`    | `string`                                   | _(required)_        | A Slack webhook URL; see the [Slack API docs] on how to obtain one.                                                                                               |
| `threshold`     | `LogLevel`, `number`                       | `LogLevel.ERROR`    | The lowest level of entries which will be posted to the configured channel. Any entries below this level will be ignored.                                         |
| `channel`       | `string`                                   |                     | The Slack channel ID the message should be posted to. This only works with [legacy Slack webhooks].                                                               |
| `username`      | `string`                                   |                     | The slack username the message should be posted under. This only works with [legacy Slack webhooks].                                                              |
| `iconUrl`       | `string`                                   |                     | The URL of an icon to be used in place of the default icon. This only works with [legacy Slack webhooks].                                                         |
| `iconEmoji`     | `string`                                   |                     | An emoji code string to use in place of the default icon. This only works with [legacy Slack webhooks].                                                           |
| `errorCallback` | `(err: Error) => void`                     | _(see description)_ | A callback which will be called when sending a message to Slack fails. The default callback will simply log the error into the console.                           |
| `bodyMapper`    | `(entry: LogEntry) => Record<string, any>` | _(see description)_ | A callback mapping the log entry to payload to be sent to the configured webhook URL. At a minimum the payload must include a `text` key with a `string` content. |

[Slack API docs]: https://api.slack.com/messaging/webhooks
[legacy Slack webhooks]: https://api.slack.com/legacy/custom-integrations/messaging/webhooks
