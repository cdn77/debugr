import { Logger as LoggerInterface } from 'typeorm';
import { Logger, Plugin, LogLevel, TContextBase, TContextShape } from '@debugr/core';
import { SqlLogEntry } from './types';

const levelMap = {
  log: LogLevel.INFO,
  info: LogLevel.INFO,
  warn: LogLevel.WARNING,
};

export class TypeormLogger<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> implements Plugin<Partial<TTaskContext>, TGlobalContext>, LoggerInterface
{
  public readonly id: string = 'typeorm';

  public readonly entryFormat: string = 'sql';

  private logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  public static create<
    TTaskContext extends TContextBase,
    TGlobalContext extends TContextShape,
  >(): TypeormLogger<Partial<TTaskContext>, TGlobalContext> {
    return new TypeormLogger<Partial<TTaskContext>, TGlobalContext>();
  }

  injectLogger(logger: Logger<Partial<TTaskContext>, TGlobalContext>): void {
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
      format: 'sql',
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
      format: 'sql',
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
      format: 'sql',
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
