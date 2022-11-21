import type { Logger } from './logger';
import type { EntryType, Plugin, PluginId, Plugins, TContextBase, TContextShape } from './types';
import { isCollectorPlugin } from './types';

export class PluginManager<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  private readonly plugins: Plugins<TTaskContext, TGlobalContext>;

  public constructor() {
    this.plugins = {};
  }

  public init(logger: Logger<TTaskContext, TGlobalContext>): void {
    for (const plugin of Object.values(this.plugins)) {
      plugin.injectLogger && plugin.injectLogger(logger, this);
    }
  }

  public register(plugin: Plugin<TTaskContext, TGlobalContext>): void {
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

  public find<T extends Plugin<TTaskContext, TGlobalContext>>(
    predicate: (plugin: Plugin<TTaskContext, TGlobalContext>) => plugin is T,
  ): T[] {
    return Object.values(this.plugins).filter(predicate);
  }

  public getKnownEntryTypes(): EntryType[] {
    return [...new Set(this.find(isCollectorPlugin).flatMap((p) => p.entryTypes))];
  }
}
