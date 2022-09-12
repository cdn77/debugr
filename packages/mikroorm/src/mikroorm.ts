import type { CollectorPlugin, Logger, TContextBase, TContextShape } from '@debugr/core';
import { LogLevel } from '@debugr/core';
import { MikroORMLoggerBridge } from './bridge';
import type { MikroORMLevelMap, MikroORMNamespaceMap, MikroORMPluginOptions } from './types';

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

export class MikroORMPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> implements CollectorPlugin<TTaskContext, TGlobalContext> {
  public readonly id: string = 'mikroorm';

  public readonly entryTypes: string[] = ['sql.query'];

  private readonly namespaceMap: MikroORMNamespaceMap;

  private readonly levelMap: MikroORMLevelMap;

  private logger?: Logger;

  private bridge?: MikroORMLoggerBridge;

  constructor({ namespaces = {}, levels = {} }: MikroORMPluginOptions = {}) {
    this.namespaceMap = { ...defaultNamespaceMap, ...namespaces };
    this.levelMap = { ...defaultLevelMap, ...levels };
  }

  injectLogger(logger: Logger<TTaskContext, TGlobalContext>): void {
    this.logger = logger;
  }

  getBridge(): MikroORMLoggerBridge {
    if (!this.bridge) {
      if (!this.logger) {
        throw new Error(
          'MikroORM Debugr plugin incorrectly initialised: please call injectLogger()',
        );
      }

      this.bridge = new MikroORMLoggerBridge(this.logger, this.namespaceMap, this.levelMap);
    }

    return this.bridge;
  }
}
