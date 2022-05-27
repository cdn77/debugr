import { EventDispatcher, Events } from '../events';
import { isFormatterPlugin, Plugin, PluginId, PluginManager, Plugins } from '../plugins';
import { Logger, LogHandler, TContextBase, TContextShape } from '../logger';

export class Debugr<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  private readonly eventDispatcher: EventDispatcher;

  public readonly pluginManager: PluginManager<Partial<TTaskContext>, TGlobalContext>;

  public readonly logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  public constructor(
    eventDispatcher: EventDispatcher,
    pluginManager: PluginManager<Partial<TTaskContext>, TGlobalContext>,
    logger: Logger<Partial<TTaskContext>, TGlobalContext>,
    plugins: Plugin<Partial<TTaskContext>, TGlobalContext>[],
  ) {
    this.eventDispatcher = eventDispatcher;
    this.pluginManager = pluginManager;
    this.logger = logger;

    for (const plugin of plugins) {
      this.pluginManager.register(plugin);
    }

    for (const logHandler of this.logger.getAllHandlers()) {
      logHandler.injectPluginManager(this.pluginManager);
    }

    this.checkFormatters();
  }

  public static create<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  >(
    globalContext: TGlobalContext,
    logHandlers: LogHandler<Partial<TTaskContext>, TGlobalContext>[],
    plugins: Plugin<Partial<TTaskContext>, TGlobalContext>[],
  ): Debugr<Partial<TTaskContext>, TGlobalContext> {
    const logger = new Logger<Partial<TTaskContext>, TGlobalContext>(
      logHandlers || [],
      globalContext,
    );
    const pluginManager = new PluginManager<Partial<TTaskContext>, TGlobalContext>(logger);

    for (const logHandler of logHandlers) {
      logHandler.injectPluginManager(pluginManager);
    }

    const debugr = new Debugr<Partial<TTaskContext>, TGlobalContext>(
      new EventDispatcher(1000),
      pluginManager,
      logger,
      plugins || [],
    );
    return debugr;
  }

  public hasPlugin(id: string): boolean {
    return this.pluginManager.has(id);
  }

  public getPlugin<ID extends PluginId>(
    id: ID,
  ): Plugins<Partial<TTaskContext>, TGlobalContext>[ID] {
    return this.pluginManager.get(id);
  }

  public hasHandler(id: string): boolean {
    return this.logger.hasHandler(id);
  }

  public getHandler(id: string): LogHandler<Partial<TTaskContext>, TGlobalContext> | never {
    return this.logger.getHandler(id);
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

  private checkFormatters(): void | never {
    const plugins = this.pluginManager.getAll();
    const logHandlers = this.logger.getAllHandlers();
    const formatterPluginsErrors: string[] = [];
    for (const logHandler of logHandlers) {
      if (!logHandler.doesNeedFormatters) {
        continue;
      }

      const entryFormats = new Set(...plugins.map((plugin) => plugin.entryFormat));

      for (const entryFormat of entryFormats) {
        const plugin = plugins.find((plugin) => {
          if (!isFormatterPlugin(plugin)) {
            return false;
          }
          return (
            plugin.handlerSupport === logHandler.identifier && entryFormat === plugin.entryFormat
          );
        });

        if (!plugin) {
          formatterPluginsErrors.push(
            `log handler identifier: ${logHandler.identifier} for format ${entryFormat}`,
          );
        }
      }
    }

    if (formatterPluginsErrors.length) {
      throw new Error(
        `Should install formatter plugins for combinations of log handler and entry format: ${formatterPluginsErrors}`,
      );
    }
  }
}
