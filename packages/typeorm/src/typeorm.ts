import { Logger as LoggerInterface } from 'typeorm';
import { Logger, Plugin, LogLevel, TContextBase } from '@debugr/core';
import { SqlLogEntry } from './types';

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
  public readonly id: string = 'typeorm';

  public readonly entryFormat: string = 'sql';

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
    const entry: Omit<SqlLogEntry, 'context' | 'ts'> = {
      formatId: 'sql',
      level: LogLevel.DEBUG,
      data: {
        query,
        parameters,
      },
    };
    this.logger.add(entry);
  }

  logQueryError(error: string, query: string, parameters?: any[]): void {
    const entry: Omit<SqlLogEntry, 'context' | 'ts'> = {
      formatId: 'sql',
      level: LogLevel.ERROR,
      data: {
        query,
        parameters,
        error,
        stack: Error().stack,
      },
    };
    this.logger.add(entry);
  }

  logQuerySlow(time: number, query: string, parameters?: any[]): void {
    const entry: Omit<SqlLogEntry, 'context' | 'ts'> = {
      formatId: 'sql',
      level: LogLevel.WARNING,
      message: 'Slow query',
      data: {
        query,
        parameters,
        time,
      },
    };
    this.logger.add(entry);
  }

  logSchemaBuild(message: string): void {
    this.logger.log(LogLevel.DEBUG, message);
  }
}
