import { Logger as LoggerInterface } from 'typeorm';
import { Container, ContainerAware, Logger, Plugin, LogLevel } from '@debugr/core';
import { SqlFormatter } from '@debugr/sql-formatter';

const levelMap = {
  log: LogLevel.INFO,
  info: LogLevel.INFO,
  warn: LogLevel.WARNING,
};

export class TypeormLogger implements ContainerAware, Plugin, LoggerInterface {
  readonly id: string = 'typeorm';

  private logger: Logger;

  injectContainer(container: Container): void {
    this.logger = container.get('logger');
    const pluginManager = container.get('pluginManager');

    if (!pluginManager.has('sql')) {
      pluginManager.register(new SqlFormatter());
    }
  }

  log(level: 'log' | 'info' | 'warn', message: any): void {
    this.logger.log(levelMap[level], message);
  }

  logMigration(message: string): void {
    this.logger.log(LogLevel.DEBUG, message);
  }

  logQuery(query: string, parameters?: any[]): void {
    this.logger.pluginLog('sql', LogLevel.DEBUG, {
      query,
      parameters,
    });
  }

  logQueryError(error: string, query: string, parameters?: any[]): void {
    this.logger.pluginLog('sql', LogLevel.ERROR, {
      query,
      parameters,
      error,
      stack: Error().stack,
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]): void {
    this.logger.pluginLog('sql', LogLevel.WARNING, 'Slow query', {
      query,
      parameters,
      time,
    });
  }

  logSchemaBuild(message: string): void {
    this.logger.log(LogLevel.DEBUG, message);
  }
}
