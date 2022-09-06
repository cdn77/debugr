import type { LogEntry, ReadonlyRecursive, TContextBase, TContextShape } from '@debugr/core';
import { LogHandler, LogLevel } from '@debugr/core';
import fetch from 'node-fetch';
import type { SlackHandlerOptions } from './types';

export class SlackHandler<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
> extends LogHandler<TTaskContext> {
  public readonly identifier: string = 'elastic';

  public readonly doesNeedFormatters: boolean = false;

  public readonly threshold: LogLevel | number;

  private readonly options: SlackHandlerOptions<TTaskContext, TGlobalContext>;

  constructor(options: SlackHandlerOptions<TTaskContext, TGlobalContext>) {
    super();
    this.options = options;
    this.threshold = options.threshold ?? LogLevel.ERROR;
  }

  public injectPluginManager(): void {}

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options: SlackHandlerOptions<TTaskContext, TGlobalContext>,
  ): SlackHandler<TTaskContext, TGlobalContext> {
    return new SlackHandler<TTaskContext, TGlobalContext>(options);
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
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
