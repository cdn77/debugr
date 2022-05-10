import { LogEntry, Logger, TContextBase } from '../logger';

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
  injectLogger(logger: Logger<Partial<TContext>, TGlobalContext>): void;
}

export interface FormatterPlugin<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> extends Plugin<Partial<TContext>, TGlobalContext> {
  getEntryLabel(entry: LogEntry<Partial<TContext>, TGlobalContext>): string;
  getEntryTitle(entry: LogEntry<Partial<TContext>, TGlobalContext>): string;
  formatHtmlEntry(entry: LogEntry<Partial<TContext>, TGlobalContext>): string;
  formatConsoleEntry(entry: LogEntry<Partial<TContext>, TGlobalContext>): string;
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
    typeof (plugin as FormatterPlugin<Partial<TContext>, TGlobalContext>).formatHtmlEntry ===
      'function' &&
    typeof (plugin as FormatterPlugin<Partial<TContext>, TGlobalContext>).formatConsoleEntry ===
      'function'
  );
}
