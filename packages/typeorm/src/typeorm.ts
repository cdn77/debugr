import { Logger as LoggerInterface } from 'typeorm';
import { Logger, Plugin, LogLevel, TContextBase, TContextShape } from '@debugr/core';
import { SqlLogEntry } from '@debugr/sql-common';

const defaultLevelMap = {
  log: LogLevel.INFO,
  info: LogLevel.INFO,
  warn: LogLevel.WARNING,
};

export type TypeORMLoggerOptions = {
  mapLevel?: {
    log: LogLevel | number;
    info: LogLevel | number;
    error: LogLevel | number;
    warn: LogLevel | number;
  };
  migrationLevel?: LogLevel | number;
  queryLevel?: LogLevel | number;
  slowQueryLevel?: LogLevel | number;
  schemaBuildLevel?: LogLevel | number;
};

export class TypeORMPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements Plugin<TTaskContext, TGlobalContext>, LoggerInterface
{
  public readonly id: string = 'typeorm';

  public readonly entryFormat: string = 'sql';

  private logger: Logger<TTaskContext, TGlobalContext>;

  private options?: TypeORMLoggerOptions;

  public constructor(options?: TypeORMLoggerOptions) {
    this.options = options;
  }

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: TypeORMLoggerOptions,
  ): TypeORMPlugin<TTaskContext, TGlobalContext> {
    return new TypeORMPlugin<TTaskContext, TGlobalContext>(options);
  }

  injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  log(level: 'log' | 'info' | 'warn', message: any): void {
    this.logger.log(
      this.options?.mapLevel ? this.options.mapLevel[level] : defaultLevelMap[level],
      message,
    );
  }

  logMigration(message: string): void {
    this.logger.log(this.options?.migrationLevel ?? LogLevel.DEBUG, message);
  }

  logQuery(query: string, parameters?: any[]): void {
    this.logger.add<SqlLogEntry>({
      format: 'sql',
      level: this.options?.queryLevel ?? LogLevel.DEBUG,
      data: {
        query,
        parameters,
      },
    });
  }

  logQueryError(error: string, query: string, parameters?: any[]): void {
    this.logger.add<SqlLogEntry>({
      format: 'sql',
      level: this.options?.mapLevel?.error ?? LogLevel.ERROR,
      data: {
        query,
        parameters,
        error,
        stack: Error().stack,
      },
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]): void {
    this.logger.add<SqlLogEntry>({
      format: 'sql',
      level: this.options?.slowQueryLevel ?? LogLevel.WARNING,
      message: 'Slow query',
      data: {
        query,
        parameters,
        time,
      },
    });
  }

  logSchemaBuild(message: string): void {
    this.logger.log(this.options?.schemaBuildLevel ?? LogLevel.DEBUG, message);
  }
}
