import {
  FormatterPlugin,
  LogEntry,
  Plugin,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';

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
  return (
    (plugin as any).targetHandler === 'console' && typeof (plugin as any).formatEntry === 'function'
  );
}
