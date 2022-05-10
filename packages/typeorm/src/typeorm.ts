import { Logger as LoggerInterface } from 'typeorm';
import { Logger, Plugin, LogLevel, TContextBase } from '@debugr/core';
// import { SqlFormatter } from '@debugr/sql-formatter';

const levelMap = {
  log: LogLevel.INFO,
  info: LogLevel.INFO,
  warn: LogLevel.WARNING,
};

export class TypeormLogger<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> implements Plugin<Partial<TContext>, TGlobalContext>, LoggerInterface
{
  readonly id: string = 'typeorm';

  private logger: Logger<Partial<TContext>, TGlobalContext>;

  injectLogger(logger: Logger<Partial<TContext>, TGlobalContext>): void {
    this.logger = logger;
  }

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
