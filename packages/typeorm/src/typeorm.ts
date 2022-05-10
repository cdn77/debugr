import { Logger as LoggerInterface } from 'typeorm';
import { Logger, Plugin, LogLevel } from '@debugr/core';
// import { SqlFormatter } from '@debugr/sql-formatter';

const levelMap = {
  log: LogLevel.INFO,
  info: LogLevel.INFO,
  warn: LogLevel.WARNING,
};

export class TypeormLogger implements Plugin, LoggerInterface {
  readonly id: string = 'typeorm';

  private logger: Logger;

  // injectContainer(container: Container): void {
  //   this.logger = container.get('logger');
  //   const pluginManager = container.get('pluginManager');

  //   if (!pluginManager.has('sql')) {
  //     pluginManager.register(new SqlFormatter());
  //   }
  // }

  log(level: 'log' | 'info' | 'warn', message: any): void {
    this.logger.log(levelMap[level], message);
  }

  logMigration(message: string): void {
    this.logger.log(LogLevel.DEBUG, message);
  }

  logQuery(query: string, parameters?: any[]): void {
    this.logger.add({
      pluginId: 'sql',
      level: LogLevel.DEBUG,
      data: {
        query,
        parameters,
      },
    });
  }

  logQueryError(error: string, query: string, parameters?: any[]): void {
    this.logger.add({
      pluginId: 'sql',
      level: LogLevel.ERROR,
      data: {
        query,
        parameters,
        error,
        stack: Error().stack,
      },
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]): void {
    this.logger.add({
      pluginId: 'sql',
      level: LogLevel.WARNING,
      message: 'Slow query',
      data: {
        query,
        parameters,
        time,
      },
    });
  }

  logSchemaBuild(message: string): void {
    this.logger.log(LogLevel.DEBUG, message);
  }
}
