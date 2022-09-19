import type {
  FormatterPlugin,
  LogEntry,
  Plugin,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';
import { isFormatterPlugin } from '@debugr/core';

export interface HtmlFormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends FormatterPlugin<TTaskContext, TGlobalContext> {
  readonly targetHandler: 'html';
  getEntryLabel?(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
  getEntryTitle(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
  renderEntry(entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>): string;
}

export function isHtmlFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is HtmlFormatterPlugin<TTaskContext, TGlobalContext> {
  return isFormatterPlugin(plugin) && plugin.targetHandler === 'html';
}
