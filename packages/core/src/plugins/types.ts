import { LogEntry, Logger, ReadonlyRecursive, TContextBase, TContextShape } from '../logger';
import { PluginManager } from './manager';

export interface Plugins<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  [id: string]: Plugin<TTaskContext, TGlobalContext>;
}

export type PluginId = Exclude<keyof Plugins, number | symbol>;

export interface Plugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  readonly id: string;
  readonly entryFormat: string;
  injectLogger(logger: Logger<TTaskContext, TGlobalContext>, pluginManager: PluginManager): void;
}

export interface FormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends Plugin<TTaskContext, TGlobalContext> {
  readonly targetHandler: string;
  getEntryLabel(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
  getEntryTitle(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
  formatEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
}

export function isFormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is FormatterPlugin<TTaskContext, TGlobalContext> {
  return (
    typeof (plugin as any).getEntryLabel === 'function' &&
    typeof (plugin as any).formatEntry === 'function'
  );
}
