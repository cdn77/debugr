import { EventDispatcher, Events } from '../events';
import { Plugin, PluginId, PluginManager, Plugins } from '../plugins';
import { Logger } from '../logger';
import { Factory } from '../di';

export class Debugr {
  private readonly eventDispatcher: EventDispatcher;

  private readonly pluginManager: PluginManager;

  readonly getLogger: Factory<Logger>;

  constructor(
    eventDispatcher: EventDispatcher,
    pluginManager: PluginManager,
    loggerAccessor: Factory<Logger>,
    plugins: Plugin[],
  ) {
    this.eventDispatcher = eventDispatcher;
    this.pluginManager = pluginManager;
    this.getLogger = loggerAccessor;

    this.registerPlugins(plugins);
  }

  registerPlugins(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  registerPlugin(plugin: Plugin): void {
    this.pluginManager.register(plugin);
  }

  hasPlugin(id: string): boolean {
    return this.pluginManager.has(id);
  }

  getPlugin<ID extends PluginId>(id: ID): Plugins[ID] {
    return this.pluginManager.get(id);
  }

  on<E extends keyof Events>(event: E, listener: Events[E]): void {
    this.eventDispatcher.on(event, listener);
  }

  once<E extends keyof Events>(event: E, listener: Events[E]): void {
    this.eventDispatcher.once(event, listener);
  }

  off<E extends keyof Events>(event: E, listener?: Events[E]): void {
    this.eventDispatcher.off(event, listener);
  }

  registerListeners(listeners: Partial<Events>): void {
    this.eventDispatcher.register(listeners);
  }
}
