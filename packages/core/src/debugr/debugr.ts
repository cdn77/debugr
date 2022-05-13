import EventEmitter from 'events';
import { EventDispatcher, Events } from '../events';
import {
  FormatterPlugin,
  isFormatterPlugin,
  Plugin,
  PluginId,
  PluginManager,
  Plugins,
} from '../plugins';
import { Logger, LogHandler, TContextBase } from '../logger';

export class Debugr<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
> {
  private readonly eventDispatcher: EventDispatcher;

  private readonly pluginManager: PluginManager<Partial<TContext>, TGlobalContext>;

  public readonly logger: Logger<Partial<TContext>, TGlobalContext>;

  private constructor(
    eventDispatcher: EventDispatcher,
    pluginManager: PluginManager<Partial<TContext>, TGlobalContext>,
    logger: Logger<Partial<TContext>, TGlobalContext>,
    logHandlers: LogHandler<Partial<TContext>, TGlobalContext>[],
    plugins: Plugin<Partial<TContext>, TGlobalContext>[],
  ) {
    this.eventDispatcher = eventDispatcher;
    this.pluginManager = pluginManager;
    this.logger = logger;

    for (const plugin of plugins) {
      this.pluginManager.register(plugin);
    }

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
            (plugin as FormatterPlugin).handlerSupport === logHandler.identifier &&
            entryFormat === (plugin as FormatterPlugin).entryFormat
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

  public static create<
    TContext extends TContextBase = { processId: string },
    TGlobalContext extends Record<string, any> = {},
  >(
    globalContext: TGlobalContext,
    plugins: Plugin<Partial<TContext>, TGlobalContext>[],
    logHandlers: LogHandler<Partial<TContext>, TGlobalContext>[],
  ): Debugr<Partial<TContext>, TGlobalContext> {
    const logger = new Logger<Partial<TContext>, TGlobalContext>(logHandlers, globalContext);
    const debugr = new Debugr<Partial<TContext>, TGlobalContext>(
      new EventDispatcher(new EventEmitter(), 1000),
      new PluginManager<Partial<TContext>, TGlobalContext>(logger),
      logger,
      logHandlers,
      plugins,
    );
    return debugr;
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
