import { Plugin, PluginId, Plugins } from './types';
import { Container, isContainerAware } from '../di';

export class PluginManager {
  private readonly container: Container;

  private readonly plugins: Plugins;

  constructor(container: Container) {
    this.container = container;
    this.plugins = {};
  }

  public register(plugin: Plugin): void {
    this.plugins[plugin.id] = plugin;

    if (isContainerAware(plugin)) {
      plugin.injectContainer(this.container);
    }
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
