import type { LogLevel } from '@debugr/core';
import type { LoggerNamespace } from '@mikro-orm/core';

export type MikroORMLogNamespace = LoggerNamespace;
export type MikroORMLogLevel = 'info' | 'warning' | 'error';

export type MikroORMNamespaceMap = {
  [namespace in MikroORMLogNamespace]: LogLevel;
};

export type MikroORMLevelMap = {
  [level in MikroORMLogLevel]: LogLevel;
};

export type MikroORMPluginOptions = {
  namespaces?: Partial<MikroORMNamespaceMap>;
  levels?: Partial<MikroORMLevelMap>;
};
