import type {
  HandlerPlugin,
  LogEntry,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel } from '@debugr/core';
import fetch from 'node-fetch';
import type { SlackHandlerOptions } from './types';

export class SlackHandler<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>
  implements HandlerPlugin<TTaskContext>
{
  public readonly id: string = 'slack';
  public readonly kind = 'handler' as const;
  private readonly options: SlackHandlerOptions<TTaskContext, TGlobalContext>;
  private readonly threshold: LogLevel | number;

  public constructor(options: SlackHandlerOptions<TTaskContext, TGlobalContext>) {
    this.options = options;
    this.threshold = options.threshold ?? LogLevel.ERROR;
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    if (entry.level < this.threshold) {
      return;
    }

    const body = this.options.bodyMapper
      ? this.options.bodyMapper(entry)
      : this.defaultBodyMapper(entry);

    try {
      await fetch(this.options.webhookUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: this.options.channel,
          username: this.options.username,
          icon_url: this.options.iconUrl,
          icon_emoji: this.options.iconEmoji,
          ...body,
        }),
      });
    } catch (error) {
      if (this.options.errorCallback) {
        this.options.errorCallback(error);
      } else {
        this.defaultErrorCallback(error);
      }
    }
  }

  private defaultErrorCallback(error: Error): void {
    console.log('SLACK CONNECTION ERROR HAPPENED', error);
  }

  private defaultBodyMapper(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Record<string, any> {
    return {
      text: `:warning: *Alert* :warning:

>>>*Alert message:* ${entry.message}

*Full error:*
\`\`\`
${JSON.stringify(entry, null, 2)}
\`\`\`
`,
    };
  }
}
