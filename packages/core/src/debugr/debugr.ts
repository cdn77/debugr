import {
  FormatterPlugin,
  isFormatterPlugin,
  Plugin,
  PluginId,
  PluginManager,
  Plugins,
} from '../plugins';
import { Logger, LogHandler, TContextBase, TContextShape } from '../logger';

export class Debugr<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
> {
  public readonly pluginManager: PluginManager<Partial<TTaskContext>, TGlobalContext>;

  public readonly logger: Logger<Partial<TTaskContext>, TGlobalContext>;

  public constructor(
    pluginManager: PluginManager<Partial<TTaskContext>, TGlobalContext>,
    logger: Logger<Partial<TTaskContext>, TGlobalContext>,
    plugins: Plugin<Partial<TTaskContext>, TGlobalContext>[],
  ) {
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

  private checkFormatters(): void | never {
    const plugins = this.pluginManager.getAll().filter((plugin) => {
      return isFormatterPlugin(plugin);
    }) as FormatterPlugin<Partial<Partial<TTaskContext>>, TGlobalContext>[];
    const logHandlers = this.logger.getAllHandlers();
    const formatterPluginsErrors: string[] = [];
    const entryFormats = new Set(...plugins.map((plugin) => plugin.entryFormat));
    for (const logHandler of logHandlers) {
      if (!logHandler.doesNeedFormatters) {
        continue;
      }

      for (const entryFormat of entryFormats) {
        const plugin = plugins.find((plugin) => {
          return (
            plugin.targetHandler === logHandler.identifier && entryFormat === plugin.entryFormat
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
