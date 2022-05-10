import EventEmitter from 'events';
import { EventDispatcher, Events } from '../events';
import { Plugin, PluginId, PluginManager, Plugins } from '../plugins';
import { Logger, TContextBase } from '../logger';

export class Debugr<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  private readonly eventDispatcher: EventDispatcher;

  private readonly pluginManager: PluginManager;

  public readonly logger: Logger;

  public constructor(
    eventDispatcher: EventDispatcher,
    pluginManager: PluginManager,
    logger: Logger<Partial<TContext>, TGlobalContext>,
    plugins: Plugin[],
  ) {
    this.eventDispatcher = eventDispatcher;
    this.pluginManager = pluginManager;
    this.logger = logger;

    this.registerPlugins(plugins);
  }

  public static create<
    TContext extends TContextBase = { processId: string },
    TGlobalContext extends Record<string, any> = {},
  >(globalContext: TGlobalContext): Debugr<Partial<TContext>, TGlobalContext> {
    return new Debugr<Partial<TContext>, TGlobalContext>(
      new EventDispatcher(new EventEmitter(), 1000),
      new PluginManager(),
      new Logger<Partial<TContext>, TGlobalContext>([], globalContext),
      [],
    );
  }

  public registerPlugins(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  public registerPlugin(plugin: Plugin): void {
    this.pluginManager.register(plugin);
  }

  public hasPlugin(id: string): boolean {
    return this.pluginManager.has(id);
  }

  public getPlugin<ID extends PluginId>(id: ID): Plugins[ID] {
    return this.pluginManager.get(id);
  }

  public on<E extends keyof Events>(event: E, listener: Events[E]): void {
    this.eventDispatcher.on(event, listener);
  }

  public once<E extends keyof Events>(event: E, listener: Events[E]): void {
    this.eventDispatcher.once(event, listener);
  }

  public off<E extends keyof Events>(event: E, listener?: Events[E]): void {
    this.eventDispatcher.off(event, listener);
  }

  public registerListeners(listeners: Partial<Events>): void {
    this.eventDispatcher.register(listeners);
  }
}
