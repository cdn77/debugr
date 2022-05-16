import { LogEntry, LogLevel, TContextBase, LogHandler } from '@debugr/core';
import { Axios } from 'axios';

export interface SlackHandlerOptions<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  webhookUrl: string;
  threshold: LogLevel | number;
  channel?: string;
  username?: string;
  iconUrl?: string;
  iconEmoji?: string;
  errorCallback?: (error: Error) => void;
  bodyParser?: (entry: LogEntry<Partial<TContext>, TGlobalContext>) => Record<string, any>;
}

export class SlackHandler<
  TContext extends TContextBase,
  TGlobalContext extends Record<string, any>,
> extends LogHandler<TContext> {
  public readonly identifier: string = 'elastic';

  public readonly doesNeedFormatters: boolean = false;

  private readonly opts: SlackHandlerOptions<TContext, TGlobalContext>;

  private readonly axios: Axios;

  constructor(opts: SlackHandlerOptions<TContext, TGlobalContext>) {
    super();
    this.opts = opts;
    this.axios = new Axios();
  }

  public static create<TContext extends TContextBase, TGlobalContext extends Record<string, any>>(
    opts: SlackHandlerOptions<TContext, TGlobalContext>,
  ): SlackHandler<TContext, TGlobalContext> {
    const instance = new SlackHandler<TContext, TGlobalContext>(opts);
    return instance;
  }

  log(entry: LogEntry<TContext, TGlobalContext>): void {
    const body = this.opts.bodyParser ? this.opts.bodyParser(entry) : this.defaultBodyParser(entry);
    this.axios
      .post(this.opts.webhookUrl, {
        channel: this.opts.channel,
        username: this.opts.username,
        icon_url: this.opts.iconUrl,
        icon_emoji: this.opts.iconEmoji,
        ...body,
      })
      .catch((error) =>
        this.opts.errorCallback ? this.opts.errorCallback(error) : this.defaultErrorCallback(error),
      );
  }

  private defaultErrorCallback(error: Error): void {
    console.log('SLACK CONNECTION ERROR HAPPENED', error);
  }

  private defaultBodyParser(entry: LogEntry<TContext, TGlobalContext>): Record<string, any> {
    return {
      text: `
:warning: *Alert* :warning:

>>>*Alert message:* ${entry.message}

*Full error:* \n \`\`\`${JSON.stringify(entry)}\`\`\`\n
  `,
    };
  }

  flush = undefined;

  fork = undefined;
}
