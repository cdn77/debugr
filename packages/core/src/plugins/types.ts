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
  getEntryLabel(entry: LogEntry): string;
  getEntryTitle(entry: LogEntry): string;
  formatHtmlEntry(entry: LogEntry): string;
  formatConsoleEntry(entry: LogEntry): string;
}

export function isFormatterPlugin(plugin: Plugin): plugin is FormatterPlugin {
  return (
    typeof (plugin as any).getEntryLabel === 'function' &&
    typeof (plugin as any).formatHtmlEntry === 'function' &&
    typeof (plugin as any).formatConsoleEntry === 'function'
  );
}
