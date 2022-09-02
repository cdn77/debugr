import type { Logger, TContextBase, TContextShape } from '../logger';
import type { Plugin, PluginId, Plugins } from './types';

export class PluginManager<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
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

  public find<T extends Plugin<TTaskContext, TGlobalContext>>(
    predicate: (plugin: Plugin<TTaskContext, TGlobalContext>) => plugin is T,
  ): T[] {
    return Object.values(this.plugins).filter(predicate);
  }

  public getKnownEntryFormats(): string[] {
    const formats = new Set(Object.values(this.plugins).map((p) => p.entryFormat));
    return [...formats];
  }
}
