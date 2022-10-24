import type {
  FormatterPlugin,
  LogEntry,
  Plugin,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { isFormatterPlugin } from '@debugr/core';

export interface ConsoleFormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends FormatterPlugin<TTaskContext, TGlobalContext> {
  readonly targetHandler: 'console';
  formatEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
}

export function isConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is ConsoleFormatterPlugin<TTaskContext, TGlobalContext> {
  return isFormatterPlugin(plugin) && plugin.targetHandler === 'console';
}