import EventEmitter from 'events';
import { EventDispatcher, Events } from '../events';
import { Plugin, PluginId, PluginManager, Plugins } from '../plugins';
import { Logger, TContextBase } from '../logger';

export class Debugr<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  private readonly eventDispatcher: EventDispatcher;

  private readonly pluginManager: PluginManager<Partial<TContext>, TGlobalContext>;

  public readonly logger: Logger<Partial<TContext>, TGlobalContext>;

  public constructor(
    eventDispatcher: EventDispatcher,
    pluginManager: PluginManager<Partial<TContext>, TGlobalContext>,
    logger: Logger<Partial<TContext>, TGlobalContext>,
    plugins: Plugin<Partial<TContext>, TGlobalContext>[],
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
    const logger = new Logger<Partial<TContext>, TGlobalContext>([], globalContext);
    return new Debugr<Partial<TContext>, TGlobalContext>(
      new EventDispatcher(new EventEmitter(), 1000),
      new PluginManager<Partial<TContext>, TGlobalContext>(logger),
      logger,
      [],
    );
  }

  public registerPlugins(plugins: Plugin<Partial<TContext>, TGlobalContext>[]): void {
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  public registerPlugin(plugin: Plugin<Partial<TContext>, TGlobalContext>): void {
    this.pluginManager.register(plugin);
  }

  public hasPlugin(id: string): boolean {
    return this.pluginManager.has(id);
  }

  public getPlugin<ID extends PluginId>(id: ID): Plugins<Partial<TContext>, TGlobalContext>[ID] {
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
