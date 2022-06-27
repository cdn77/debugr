import { Logger, LogLevel, Plugin, TContextBase, TContextShape } from '@debugr/core';
import { LogContext, Logger as MikroORMLoggerInterface, LoggerNamespace } from '@mikro-orm/core';

export type MikroORMLogNamespace = LoggerNamespace;
export type MikroORMLogLevel = 'info' | 'warning' | 'error';

export type MikroORMNamespaceMap = {
  [namespace in MikroORMLogNamespace]: LogLevel;
};

export type MikroORMLevelMap = {
  [level in MikroORMLogLevel]: LogLevel;
};

export type MikroORMLoggerOptions = {
  namespaces?: Partial<MikroORMNamespaceMap>;
  levels?: Partial<MikroORMLevelMap>;
};

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

export class MikroORMLogger<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> implements Plugin<Partial<TTaskContext>, TGlobalContext>, MikroORMLoggerInterface
{
  public readonly id: string = 'mikroorm';

  public readonly entryFormat: string = 'sql';

  private readonly namespaceMap: MikroORMNamespaceMap;

  private readonly levelMap: MikroORMLevelMap;

  private logger: Logger;

  public static create<TTaskContext extends TContextBase, TGlobalContext extends TContextShape>(
    options?: MikroORMLoggerOptions,
  ): MikroORMLogger<Partial<TTaskContext>, TGlobalContext> {
    return new MikroORMLogger<Partial<TTaskContext>, TGlobalContext>(options);
  }

  constructor({ namespaces = {}, levels = {} }: MikroORMLoggerOptions = {}) {
    this.namespaceMap = { ...defaultNamespaceMap, ...namespaces };
    this.levelMap = { ...defaultLevelMap, ...levels };
  }

  injectLogger(logger: Logger<Partial<TTaskContext>, TGlobalContext>): void {
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
    this.logger.add({
      format: 'sql',
      level: this.levelMap[context.level ?? 'info'],
      data: {
        query: context.query,
        parameters: context.params,
        time: context.took,
      },
    });
  }

  setDebugMode(): void {
    /* noop */
  }
}
