import { Logger, TContextBase, TContextShape } from '../logger';
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
  injectLogger(
    logger: Logger<TTaskContext, TGlobalContext>,
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
  ): void;
}

export interface FormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> extends Plugin<TTaskContext, TGlobalContext> {
  readonly targetHandler: string;
}

export function isFormatterPlugin<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
>(
  plugin: Plugin<TTaskContext, TGlobalContext>,
): plugin is FormatterPlugin<TTaskContext, TGlobalContext> {
  return typeof (plugin as any).targetHandler === 'string';
}
