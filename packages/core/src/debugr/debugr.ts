import { Plugin, PluginId, PluginManager, Plugins } from '../plugins';
import { Logger, LogHandler, TContextBase, TContextShape } from '../logger';

export class Debugr<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  public readonly pluginManager: PluginManager<TTaskContext, TGlobalContext>;

  public readonly logger: Logger<TTaskContext, TGlobalContext>;

  public constructor(
    pluginManager: PluginManager<TTaskContext, TGlobalContext>,
    logger: Logger<TTaskContext, TGlobalContext>,
    plugins: Plugin<TTaskContext, TGlobalContext>[],
  ) {
    this.pluginManager = pluginManager;
    this.logger = logger;

    for (const plugin of plugins) {
      this.pluginManager.register(plugin);
    }

    this.logger.injectPluginManager(pluginManager);
  }

  public static create<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = {},
  >(
    globalContext: TGlobalContext,
    logHandlers: LogHandler<TTaskContext, TGlobalContext>[] = [],
    plugins: Plugin<TTaskContext, TGlobalContext>[] = [],
  ): Debugr<TTaskContext, TGlobalContext> {
    const logger = new Logger<TTaskContext, TGlobalContext>(logHandlers, globalContext);
    const pluginManager = new PluginManager<TTaskContext, TGlobalContext>(logger);

    for (const logHandler of logHandlers) {
      logHandler.injectPluginManager(pluginManager);
    }

    return new Debugr<TTaskContext, TGlobalContext>(pluginManager, logger, plugins);
  }

  public hasPlugin(id: string): boolean {
    return this.pluginManager.has(id);
  }

  public getPlugin<ID extends PluginId>(id: ID): Plugins<TTaskContext, TGlobalContext>[ID] {
    return this.pluginManager.get(id);
  }

  public hasHandler(id: string): boolean {
    return this.logger.hasHandler(id);
  }

  public getHandler(id: string): LogHandler<TTaskContext, TGlobalContext> | never {
    return this.logger.getHandler(id);
  }
}
