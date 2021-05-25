import { LogEntry } from '../queues';

export interface Plugins {
  [id: string]: Plugin;
}

export type PluginId = Exclude<keyof Plugins, number | symbol>;

export interface Plugin {
  readonly id: string;
}

export interface FormatterPlugin extends Plugin {
  getEntryLabel(entry: LogEntry): string;
  formatEntry(entry: LogEntry): string;
}

export function isFormatterPlugin(plugin: Plugin): plugin is FormatterPlugin {
  return (
    typeof (plugin as any).getEntryLabel === 'function' &&
    typeof (plugin as any).formatEntry === 'function'
  );
}
