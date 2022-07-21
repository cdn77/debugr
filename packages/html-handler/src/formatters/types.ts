import {
  LogEntry,
  FormatterPlugin,
  Plugin,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';

export interface HtmlFormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends FormatterPlugin<TTaskContext, TGlobalContext> {
  readonly targetHandler: 'html';
  getEntryLabel?(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
  getEntryTitle(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
  renderEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
}

export function isHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is HtmlFormatterPlugin<TTaskContext, TGlobalContext> {
  return (
    (plugin as any).targetHandler === 'html' && typeof (plugin as any).renderEntry === 'function'
  );
}
