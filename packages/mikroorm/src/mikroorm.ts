import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { LogLevel } from '@debugr/core';
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

export class MikroORMPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements CollectorPlugin<TTaskContext, TGlobalContext>, MikroORMLoggerInterface
{
  public readonly id: string = 'mikroorm';

  public readonly entryTypes: string[] = ['sql'];

  private readonly namespaceMap: MikroORMNamespaceMap;

  private readonly levelMap: MikroORMLevelMap;

  private logger: Logger;

  constructor({ namespaces = {}, levels = {} }: MikroORMPluginOptions = {}) {
    this.namespaceMap = { ...defaultNamespaceMap, ...namespaces };
    this.levelMap = { ...defaultLevelMap, ...levels };
  }

  injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  isEnabled(): boolean {
    return true;
  }

  log(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    this.logger.log(this.namespaceMap[namespace], message, context);
  }

  warn(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    this.logger.log(LogLevel.WARNING, message, context);
  }

  error(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    this.logger.log(LogLevel.ERROR, message, context);
  }

  logQuery(context: LogContext): void {
    if (context.query) {
      this.logger.add<SqlQueryLogEntry>({
        type: 'sql.query',
        level: this.levelMap[context.level ?? 'info'],
        data: {
          query: context.query,
          parameters: context.params,
          time: context.took,
        },
      });
    }
  }

  setDebugMode(): void {
    /* noop */
  }
}
