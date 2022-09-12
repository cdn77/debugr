import type { Logger} from '@debugr/core';
import { LogLevel } from '@debugr/core';
import type { SqlQueryLogEntry } from '@debugr/sql-common';
import type { LogContext, Logger as MikroORMLoggerInterface, LoggerNamespace } from '@mikro-orm/core';
import type { MikroORMLevelMap, MikroORMNamespaceMap } from './types';

export class MikroORMLoggerBridge implements MikroORMLoggerInterface {
  private readonly namespaceMap: MikroORMNamespaceMap;

  private readonly levelMap: MikroORMLevelMap;

  private readonly logger: Logger;

  constructor(logger: Logger, namespaceMap: MikroORMNamespaceMap, levelMap: MikroORMLevelMap) {
    this.logger = logger;
    this.namespaceMap = namespaceMap;
    this.levelMap = levelMap;
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
