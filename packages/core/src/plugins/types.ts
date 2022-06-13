import { LogEntry, Logger, ReadonlyRecursive, TContextBase, TContextShape } from '../logger';
import { PluginManager } from './manager';

export interface Plugins<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  [id: string]: Plugin<Partial<TTaskContext>, TGlobalContext>;
}

export type PluginId = Exclude<keyof Plugins, number | symbol>;

export interface Plugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  readonly id: string;
  readonly entryFormat: string;
  injectLogger(
    logger: Logger<Partial<TTaskContext>, TGlobalContext>,
    pluginManager: PluginManager,
  ): void;
}

export interface FormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends Plugin<Partial<TTaskContext>, TGlobalContext> {
  readonly entryFormat: string;
  readonly targetHandler: string;
  getEntryLabel(entry: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>>): string;
  getEntryTitle(entry: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>>): string;
  formatEntry(entry: ReadonlyRecursive<LogEntry<Partial<TTaskContext>, TGlobalContext>>): any;
}

export function isFormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
>(
  plugin: Plugin<Partial<TTaskContext>, TGlobalContext>,
): plugin is FormatterPlugin<Partial<TTaskContext>, TGlobalContext> {
  return (
    typeof (plugin as any).getEntryLabel === 'function' &&
    typeof (plugin as any).formatEntry === 'function'
  );
}
