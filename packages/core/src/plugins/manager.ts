import { Logger, TContextBase } from '../logger';
import { Plugin, PluginId, Plugins } from './types';

export class PluginManager<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  private readonly plugins: Plugins<Partial<TContext>, TGlobalContext>;

  private readonly logger: Logger<Partial<TContext>, TGlobalContext>;

  constructor(logger: Logger<Partial<TContext>, TGlobalContext>) {
    this.logger = logger;
    this.plugins = {};
  }

  public register(plugin: Plugin<Partial<TContext>, TGlobalContext>): void {
    plugin.injectLogger(this.logger);
    this.plugins[plugin.id] = plugin;
  }

  public has(id: string): boolean {
    return id in this.plugins;
  }

  public get<ID extends PluginId>(id: ID): Plugins<Partial<TContext>, TGlobalContext>[ID] {
    const plugin = this.plugins[id];

    if (!plugin) {
      throw new Error(`Unknown plugin: ${id}`);
    }

    return plugin;
  }
}
