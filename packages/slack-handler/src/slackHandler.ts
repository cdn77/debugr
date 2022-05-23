import { LogEntry, LogLevel, TContextBase, LogHandler, TContextShape } from '@debugr/core';
import fetch from 'node-fetch';

export interface SlackHandlerOptions<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> {
  webhookUrl: string;
  threshold: LogLevel | number;
  channel?: string;
  username?: string;
  iconUrl?: string;
  iconEmoji?: string;
  errorCallback?: (error: Error) => void;
  bodyMapper?: (entry: LogEntry<Partial<TTaskContext>, TGlobalContext>) => Record<string, any>;
}

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
    const instance = new SlackHandler<TTaskContext, TGlobalContext>(opts);
    return instance;
  }

  log(entry: LogEntry<TTaskContext, TGlobalContext>): void {
    const body = this.opts.bodyMapper ? this.opts.bodyMapper(entry) : this.defaultBodyParser(entry);
    fetch(this.opts.webhookUrl, {
      body: JSON.stringify({
        channel: this.opts.channel,
        username: this.opts.username,
        icon_url: this.opts.iconUrl,
        icon_emoji: this.opts.iconEmoji,
        ...body,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
    }).catch((error) =>
      this.opts.errorCallback ? this.opts.errorCallback(error) : this.defaultErrorCallback(error),
    );
  }

  private defaultErrorCallback(error: Error): void {
    console.log('SLACK CONNECTION ERROR HAPPENED', error);
  }

  private defaultBodyParser(entry: LogEntry<TTaskContext, TGlobalContext>): Record<string, any> {
    return {
      text: `
:warning: *Alert* :warning:

>>>*Alert message:* ${entry.message}

*Full error:* \n \`\`\`${JSON.stringify(entry)}\`\`\`\n
  `,
    };
  }
}
