import type {
  HandlerPlugin,
  LogEntry,
  Logger,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { LogLevel, PluginKind } from '@debugr/core';
import fetch from 'node-fetch';
import type { SlackHandlerOptions } from './types';

export class SlackHandler<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>
  implements HandlerPlugin<TTaskContext>
{
  public readonly id = 'slack';
  public readonly kind = PluginKind.Handler;

  private readonly options: SlackHandlerOptions<TTaskContext, TGlobalContext>;
  private readonly threshold: LogLevel;
  private readonly localErrors: WeakSet<Error>;
  private logger?: Logger;

  public constructor(options: SlackHandlerOptions<TTaskContext, TGlobalContext>) {
    this.options = options;
    this.threshold = options.threshold ?? LogLevel.ERROR;
    this.localErrors = new WeakSet();
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    if (
      entry.level >= LogLevel.ALL && entry.level < this.threshold
      || entry.error && this.localErrors.has(entry.error)
    ) {
      return;
    }

    const body = this.options.formatter
      ? this.options.formatter(entry)
      : this.defaultFormatter(entry);

    if (!body) {
      return;
    }

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
      this.localErrors.add(error);
      this.logger?.log(LogLevel.INTERNAL, error);
    }
  }

  private defaultFormatter(
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
