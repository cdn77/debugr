import { Events } from '../events';
import { Plugin, PluginId, Plugins } from '../plugins';
import { identify, LogEntryQueue } from '../queues';
import { Logger } from '../logger';
import { Container } from '../di';
import { FullOptions, Services } from './types';

export class Debugr {
  private readonly di: Container<FullOptions, Services>;

  constructor(di: Container<FullOptions, Services>) {
    this.di = di;

    this.di.get('eventDispatcher').on('queue.write', queue => {
      Promise.resolve(queue).then(queue => this.handleWrite(queue));
    });

    this.registerPlugins(this.di.options.plugins);
  }

  registerPlugins(plugins: Plugin[]): this {
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }

    return this;
  }

  registerPlugin(plugin: Plugin): this {
    this.di.get('pluginManager').register(plugin);
    return this;
  }

  hasPlugin(id: string): boolean {
    return this.di.get('pluginManager').has(id);
  }

  getPlugin<ID extends PluginId>(id: ID): Plugins[ID] {
    return this.di.get('pluginManager').get(id);
  }

  on<E extends keyof Events>(event: E, listener: Events[E]): this {
    this.di.get('eventDispatcher').on(event, listener);
    return this;
  }

  once<E extends keyof Events>(event: E, listener: Events[E]): this {
    this.di.get('eventDispatcher').once(event, listener);
    return this;
  }

  off<E extends keyof Events>(event: E, listener?: Events[E]): this {
    this.di.get('eventDispatcher').off(event, listener);
    return this;
  }

  registerListeners(listeners: Partial<Events>): this {
    this.di.get('eventDispatcher').register(listeners);
    return this;
  }

  createLogger(): Logger {
    return this.di.create('logger');
  }

  private async handleWrite(queue: LogEntryQueue): Promise<void> {
    const id = identify(queue);
    const writer = this.di.get('queueWriter');
    const formatter = this.di.get('formatter');

    if (this.di.options.writeDuplicates || !(await writer.exists(id))) {
      await writer.write(queue.ts, id, formatter.format(queue));
    }
  }
}
