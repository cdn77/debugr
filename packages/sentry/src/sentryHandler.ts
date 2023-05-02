import type {
  LogEntry,
  Logger,
  ReadonlyRecursive,
  TaskAwareHandlerPlugin,
  TContextBase,
  TContextShape
} from '@debugr/core';
import {
  levelToValue,
  LogLevel,
  normalizeMap,
  PluginKind
} from '@debugr/core';
import { AsyncLocalStorage } from 'async_hooks';
import fetch from 'node-fetch';
import { v4 } from 'uuid';
import { defaultLevelMap } from './maps';
import type {
  SentryDsn,
  SentryHandlerOptions, SentryLogLevel,
  SentryMessageExtractor,
  SentryThresholds
} from './types';
import { parseDsn, parseStackTrace } from './utils';

const defaultThresholds: SentryThresholds = {
  capture: LogLevel.ERROR,
  breadcrumb: LogLevel.DEBUG,
};

export class SentryHandler<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>
  implements TaskAwareHandlerPlugin<TTaskContext, TGlobalContext>
{
  public readonly id = 'sentry';
  public readonly kind = PluginKind.Handler;

  private readonly dsn?: SentryDsn;
  private readonly thresholds: SentryThresholds;
  private readonly extractMessage: SentryMessageExtractor;
  private readonly levelMap: Map<LogLevel, SentryLogLevel>;
  private readonly breadcrumbs: AsyncLocalStorage<ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>[]>;
  private readonly localErrors: WeakSet<Error>;
  private logger?: Logger;

  public constructor({
    dsn,
    thresholds = {},
    extractMessage,
    levelMap = {},
  }: SentryHandlerOptions<TTaskContext, TGlobalContext>) {
    this.dsn = parseDsn(dsn);
    this.thresholds = { ...defaultThresholds, ...thresholds };
    this.extractMessage = extractMessage ?? this.defaultExtractMessage.bind(this);
    this.levelMap = normalizeMap({ ...defaultLevelMap, ...levelMap });
    this.breadcrumbs = new AsyncLocalStorage();
    this.localErrors = new WeakSet();
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public runTask<R>(callback: () => R): R {
    return this.breadcrumbs.getStore() ? callback() : this.breadcrumbs.run([], callback);
  }

  public async log(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Promise<void> {
    const breadcrumbs = this.breadcrumbs.getStore();

    if (
      !this.dsn ||
      (entry.level >= LogLevel.ALL && entry.level < (breadcrumbs ? this.thresholds.breadcrumb : this.thresholds.capture)) ||
      (entry.error && this.localErrors.has(entry.error))
    ) {
      return;
    }

    if (entry.level === LogLevel.INTERNAL || entry.level >= this.thresholds.capture) {
      try {
        await this.capture(entry, breadcrumbs ?? []);
      } catch (error) {
        this.localErrors.add(error);
        this.logger?.log(LogLevel.INTERNAL, error);
      }
    } else if (breadcrumbs) {
      breadcrumbs.push(entry);
    }
  }

  private async capture(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
    breadcrumbs: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>[],
  ): Promise<void> {
    await this.sendRequest('store', {
      event_id: v4().replace(/-/g, ''),
      timestamp: entry.ts.toISOString(),
      platform: typeof process !== 'undefined' ? 'node' : 'javascript',
      level: levelToValue(this.levelMap, entry.level),
      breadcrumbs: breadcrumbs.map((entry) => this.getBreadcrumbPayload(entry)),
      tags: entry.taskContext && this.extractTags(entry.taskContext),
      extra: {
        ...entry.globalContext,
        ...entry.taskContext ?? {},
      },
      ...this.getEntryPayload(entry),
    });
  }

  private getEntryPayload(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Record<string, any> {
    const payload: Record<string, any> = {};

    if (entry.message) {
      payload.message = {
        formatted: entry.message,
      };
    }

    if (entry.error) {
      payload.exception = [{
        type: entry.error.name,
        value: entry.error.message,
        stacktrace: {
          frames: parseStackTrace(entry.error),
        },
      }];
    }

    return payload;
  }

  private getBreadcrumbPayload(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): Record<string, any> {
    return {
      timestamp: entry.ts.toISOString(),
      message: this.extractMessage(entry),
      type: 'debug',
      level: levelToValue(this.levelMap, entry.level),
      data: entry.data,
    };
  }

  private defaultExtractMessage(
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ): string {
    if (entry.error) {
      return entry.error.message;
    }

    if (entry.message) {
      return entry.message;
    }

    return 'Empty Message';
  }

  private extractTags(context: Readonly<Partial<TTaskContext>>, prefix: string = ''): Record<string, any> {
    const tags: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      const tag = `${prefix}${key}`;

      if (value instanceof Date) {
        tags[tag] = value.toISOString();
      } else if (Array.isArray(value)) {
        tags[tag] = value.join(',');
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(tags, this.extractTags(value, `${tag}.`));
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        tags[tag] = value;
      }
    }

    return tags;
  }

  private async sendRequest(endpoint: string, payload: Record<string, any>): Promise<void> {
    if (!this.dsn) {
      return;
    }

    const sentryAuth = [
      'Sentry sentry_version=7',
      'sentry_client=debugr-sentry-handler/3.0',
      `sentry_key=${this.dsn.publicKey}`,
    ];

    if (this.dsn.secretKey) {
      sentryAuth.push(`sentry_secret=${this.dsn.secretKey}`);
    }

    await fetch(`${this.dsn.baseUri}/${endpoint}/`, {
      method: 'post',
      headers: {
        'User-Agent': 'debugr-sentry-handler/3.0',
        'X-Sentry-Auth': sentryAuth.join(',\n'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }
}
