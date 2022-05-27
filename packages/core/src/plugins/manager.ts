import { Logger, TContextBase, TContextShape } from '../logger';
import { Plugin, PluginId, Plugins } from './types';

export class PluginManager<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  private readonly plugins: Plugins<Partial<TTaskContext>, TGlobalContext>;

  private readonly logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  constructor(logger: Logger<Partial<TTaskContext>, TGlobalContext>) {
    this.logger = logger;
    this.plugins = {};
  }

  public register(plugin: Plugin<Partial<TTaskContext>, TGlobalContext>): void {
    plugin.injectLogger(this.logger, this);
    this.plugins[plugin.id] = plugin;
  }

  public has(id: string): boolean {
    return id in this.plugins;
  }

  public get<ID extends PluginId>(id: ID): Plugins<Partial<TTaskContext>, TGlobalContext>[ID] {
    const plugin = this.plugins[id];

    if (!plugin) {
      throw new Error(`Unknown plugin: ${id}`);
    }

    return plugin;
  }

  public getAll(): Plugin<Partial<TTaskContext>, TGlobalContext>[] {
    return Object.values(this.plugins);
  }
}
