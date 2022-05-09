import { Plugin, PluginId, Plugins } from './types';

export class PluginManager {
  private readonly plugins: Plugins;

  constructor() {
    this.plugins = {};
  }

  public register(plugin: Plugin): void {
    this.plugins[plugin.id] = plugin;
  }

  public has(id: string): boolean {
    return id in this.plugins;
  }

  public get<ID extends PluginId>(id: ID): Plugins[ID] {
    const plugin = this.plugins[id];

    if (!plugin) {
      throw new Error(`Unknown plugin: ${id}`);
    }

    return plugin;
  }
}
