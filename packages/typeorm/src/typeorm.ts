import { EntityManager, Logger, QueryRunner } from 'typeorm';
import { Container, ContainerAware, LoggerInterface, Plugin } from '@debugr/core';
import { SqlFormatter } from '@debugr/sql-formatter';

const LOGGER_TAG = '@@ORM_LOGGER@@';

export function injectQueryLogger(em: EntityManager, logger: LoggerInterface): void {
  if (em.queryRunner) {
    em.queryRunner.data[LOGGER_TAG] = logger;
  }
}

const levelMap = {
  log: LoggerInterface.INFO,
  info: LoggerInterface.INFO,
  warn: LoggerInterface.WARNING,
};

export class TypeormLogger implements ContainerAware, Plugin, Logger {
  readonly id: string = 'typeorm';

  injectContainer(container: Container): void {
    const pluginManager = container.get('pluginManager');

    if (!pluginManager.has('sql')) {
      pluginManager.register(new SqlFormatter());
    }
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): void {
    this.tryLog(levelMap[level], queryRunner, message);
  }

  logMigration(message: string, queryRunner?: QueryRunner): void {
    this.tryLog(LoggerInterface.DEBUG, queryRunner, message);
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.tryLog(LoggerInterface.DEBUG, queryRunner, {
      query,
      parameters,
    });
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.tryLog(LoggerInterface.ERROR, queryRunner, {
      query,
      parameters,
      error,
      stack: Error().stack,
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.tryLog(LoggerInterface.WARNING, queryRunner, 'Slow query', {
      query,
      parameters,
      time,
    });
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    this.tryLog(LoggerInterface.DEBUG, queryRunner, message);
  }

  private tryLog(
    level: number,
    queryRunner: QueryRunner | undefined,
    data: Record<string, any>,
  ): void;
  private tryLog(
    level: number,
    queryRunner: QueryRunner | undefined,
    message: string,
    data?: Record<string, any>,
  ): void;
  private tryLog(
    level: number,
    queryRunner: QueryRunner | undefined,
    messageOrData: any,
    data?: any,
  ): void {
    const logger: LoggerInterface | undefined =
      queryRunner && queryRunner.data && queryRunner.data[LOGGER_TAG];

    if (logger) {
      if (typeof messageOrData === 'string') {
        logger.log(level, messageOrData, data);
      } else {
        logger.log('sql', level, messageOrData, data);
      }
    }
  }
}
