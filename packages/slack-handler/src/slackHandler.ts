import type {
  LogEntry,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogHandler } from '@debugr/core';
import fetch from 'node-fetch';
import { SlackHandlerOptions } from './types';

export class SlackHandler<
  TTaskContext extends TContextBase,
  TGlobalContext extends TContextShape,
> extends LogHandler<TTaskContext> {
  public readonly identifier: string = 'elastic';

  public readonly doesNeedFormatters: boolean = false;

  private readonly opts: SlackHandlerOptions<TTaskContext, TGlobalContext>;

  constructor(opts: SlackHandlerOptions<TTaskContext, TGlobalContext>) {
    super();
    this.opts = opts;
  }

  public injectPluginManager(): void {}

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    opts: SlackHandlerOptions<TTaskContext, TGlobalContext>,
  ): SlackHandler<TTaskContext, TGlobalContext> {
    return new SlackHandler<TTaskContext, TGlobalContext>(opts);
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    const body = this.opts.bodyMapper ? this.opts.bodyMapper(entry) : this.defaultBodyParser(entry);
    try {
      await fetch(this.opts.webhookUrl, {
        body: JSON.stringify({
          channel: this.opts.channel,
          username: this.opts.username,
          icon_url: this.opts.iconUrl,
          icon_emoji: this.opts.iconEmoji,
          ...body,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
      });
    } catch (error) {
      if (this.opts.errorCallback) {
        this.opts.errorCallback(error);
      } else {
        this.defaultErrorCallback(error);
      }
    }
  }

  private defaultErrorCallback(error: Error): void {
    console.log('SLACK CONNECTION ERROR HAPPENED', error);
  }

  private defaultBodyParser(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Record<string, any> {
    return {
      text: `
:warning: *Alert* :warning:

>>>*Alert message:* ${entry.message}

*Full error:* \n \`\`\`${JSON.stringify(entry)}\`\`\`\n
  `,
    };
  }
}
