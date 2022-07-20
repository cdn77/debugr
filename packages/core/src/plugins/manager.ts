import { Logger, LogHandler, TContextBase, TContextShape } from '../logger';
import { isFormatterPlugin, Plugin, PluginId, Plugins } from './types';

export class PluginManager<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  private readonly plugins: Plugins<TTaskContext, TGlobalContext>;

  private readonly logger: Logger<TTaskContext, TGlobalContext>;

  constructor(logger: Logger<TTaskContext, TGlobalContext>) {
    this.logger = logger;
    this.plugins = {};
  }

  public register(plugin: Plugin<TTaskContext, TGlobalContext>): void {
    plugin.injectLogger(this.logger, this);
    this.plugins[plugin.id] = plugin;
  }

  public has(id: string): boolean {
    return id in this.plugins;
  }

  public get<ID extends PluginId>(id: ID): Plugins<TTaskContext, TGlobalContext>[ID] {
    const plugin = this.plugins[id];

    if (!plugin) {
      throw new Error(`Unknown plugin: ${id}`);
    }

    return plugin;
  }

  public checkRequiredPlugins(handlers: Iterable<LogHandler<TTaskContext, TGlobalContext>>): void {
    this.checkRequiredFormatterPlugins(handlers);
  }

  private checkRequiredFormatterPlugins(
    handlers: Iterable<LogHandler<TTaskContext, TGlobalContext>>,
  ): void {
    const requiredFormats: Set<string> = new Set();
    const installedFormatters: Set<string> = new Set();

    for (const plugin of Object.values(this.plugins)) {
      if (isFormatterPlugin(plugin)) {
        installedFormatters.add(`${plugin.targetHandler}\0${plugin.entryFormat}`);
      } else {
        requiredFormats.add(plugin.entryFormat);
      }
    }

    const errors: string[] = [];

    for (const handler of handlers) {
      if (!handler.doesNeedFormatters) {
        continue;
      }

      const missing: string[] = [];

      for (const format of requiredFormats) {
        if (!installedFormatters.has(`${handler.identifier}\0${format}`)) {
          missing.push(format);
        }
      }

      if (missing.length) {
        errors.push(`${handler.identifier}: ${missing.join(', ')}`);
      }
    }

    if (errors.length) {
      throw new Error(
        `Missing formatters for some handler and plugin combinations: ${errors.join('; ')}`,
      );
    }
  }
}
