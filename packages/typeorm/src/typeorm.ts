import { Logger as LoggerInterface } from 'typeorm';
import { Logger, Plugin, LogLevel, TContextBase, TContextShape } from '@debugr/core';
import { SqlLogEntry } from './types';

const defaultLevelMap = {
  log: LogLevel.INFO,
  info: LogLevel.INFO,
  warn: LogLevel.WARNING,
};

export type TypeORMLoggerOptions = {
  levelMap?: {
    log: LogLevel | number;
    info: LogLevel | number;
    warn: LogLevel | number;
  };
  levelMigration?: LogLevel | number;
  levelQuery?: LogLevel | number;
  levelError?: LogLevel | number;
  levelQuerySlow?: LogLevel | number;
  levelSchemaBuild?: LogLevel | number;
};

export class TypeormLogger<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements Plugin<Partial<TTaskContext>, TGlobalContext>, LoggerInterface
{
  public readonly id: string = 'typeorm';

  public readonly entryFormat: string = 'sql';

  private logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  private options?: TypeORMLoggerOptions;

  public constructor(options?: TypeORMLoggerOptions) {
    this.options = options;
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: TypeORMLoggerOptions,
  ): TypeormLogger<Partial<TTaskContext>, TGlobalContext> {
    return new TypeormLogger<Partial<TTaskContext>, TGlobalContext>(options);
  }

  injectLogger(logger: Logger<Partial<TTaskContext>, TGlobalContext>): void {
    this.logger = logger;
  }

  log(level: 'log' | 'info' | 'warn', message: any): void {
    this.logger.log(
      this.options?.levelMap ? this.options.levelMap[level] : defaultLevelMap[level],
      message,
    );
  }

  logMigration(message: string): void {
    this.logger.log(this.options?.levelMigration ?? LogLevel.DEBUG, message);
  }

  logQuery(query: string, parameters?: any[]): void {
    const entry: Omit<SqlLogEntry, 'context' | 'ts'> = {
      format: 'sql',
      level: this.options?.levelQuery ?? LogLevel.DEBUG,
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
      level: this.options?.levelError ?? LogLevel.ERROR,
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
      level: this.options?.levelQuerySlow ?? LogLevel.WARNING,
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
    this.logger.log(this.options?.levelSchemaBuild ?? LogLevel.DEBUG, message);
  }
}
