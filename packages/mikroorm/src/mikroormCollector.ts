import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { EntryType, LogLevel, PluginKind } from '@debugr/core';
import type { SqlQueryLogEntry } from '@debugr/sql-common';
import type {
  LogContext,
  Logger as MikroORMLoggerInterface,
  LoggerNamespace,
} from '@mikro-orm/core';
import type { MikroORMLevelMap, MikroORMNamespaceMap, MikroORMPluginOptions } from './types';

const defaultNamespaceMap: MikroORMNamespaceMap = {
  discovery: LogLevel.DEBUG,
  info: LogLevel.INFO,
  query: LogLevel.INFO,
  'query-params': LogLevel.INFO,
  schema: LogLevel.INFO,
};

const defaultLevelMap: MikroORMLevelMap = {
  info: LogLevel.DEBUG,
  warning: LogLevel.WARNING,
  error: LogLevel.ERROR,
};

export class MikroORMCollector<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements CollectorPlugin<TTaskContext, TGlobalContext>, MikroORMLoggerInterface
{
  public readonly id = 'mikroorm';
  public readonly kind = PluginKind.Collector;
  public readonly entryTypes = [EntryType.SqlQuery];

  private readonly namespaceMap: MikroORMNamespaceMap;
  private readonly levelMap: MikroORMLevelMap;
  private logger: Logger;

  public constructor({ namespaces = {}, levels = {} }: MikroORMPluginOptions = {}) {
    this.namespaceMap = { ...defaultNamespaceMap, ...namespaces };
    this.levelMap = { ...defaultLevelMap, ...levels };
  }

  public injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  public isEnabled(): boolean {
    return true;
  }

  public log(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    this.logger.log(this.namespaceMap[namespace], message, context);
  }

  public warn(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    this.logger.log(LogLevel.WARNING, message, context);
  }

  public error(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    this.logger.log(LogLevel.ERROR, message, context);
  }

  public logQuery(context: LogContext): void {
    if (context.query) {
      this.logger.add<SqlQueryLogEntry>({
        type: EntryType.SqlQuery,
        level: this.levelMap[context.level ?? 'info'],
        data: {
          query: context.query,
          parameters: context.params,
          time: context.took,
        },
      });
    }
  }

  public setDebugMode(): void {
    /* noop */
  }
}
