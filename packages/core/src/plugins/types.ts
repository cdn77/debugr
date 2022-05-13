import { LogEntry, Logger, TContextBase } from '../logger';
import { PluginManager } from './manager';

export interface Plugins<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  [id: string]: Plugin<Partial<TContext>, TGlobalContext>;
}

export type PluginId = Exclude<keyof Plugins, number | symbol>;

export interface Plugin<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  readonly id: string;
  readonly entryFormat: string;
  injectLogger(
    logger: Logger<Partial<TContext>, TGlobalContext>,
    pluginManager: PluginManager,
  ): void;
}

export interface FormatterPlugin<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> extends Plugin<Partial<TContext>, TGlobalContext> {
  readonly entryFormat: string;
  readonly handlerSupport: string;
  getEntryLabel(entry: LogEntry<Partial<TContext>, TGlobalContext>): string;
  getEntryTitle(entry: LogEntry<Partial<TContext>, TGlobalContext>): string;
  formatEntry(entry: LogEntry<Partial<TContext>, TGlobalContext>): any;
}

export function isFormatterPlugin<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
>(
  plugin: Plugin<Partial<TContext>, TGlobalContext>,
): plugin is FormatterPlugin<Partial<TContext>, TGlobalContext> {
  return (
    typeof (plugin as FormatterPlugin<Partial<TContext>, TGlobalContext>).getEntryLabel ===
      'function' &&
    typeof (plugin as FormatterPlugin<Partial<TContext>, TGlobalContext>).formatEntry === 'function'
  );
}
