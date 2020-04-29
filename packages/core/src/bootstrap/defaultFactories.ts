import { EventDispatcher } from '../events';
import { Formatter } from '../formatter';
import { PluginManager } from '../plugins';
import { QueueManager, Writer } from '../queues';
import { Logger } from '../logger';
import { FactoryMap } from '../di';
import { FullOptions, Services } from './types';
import { Debugr } from './debugr';

export const defaultFactories: FactoryMap<Services, FullOptions> = {
  container: di => di,
  eventDispatcher: () => new EventDispatcher(),
  formatter: di => new Formatter(di.get('pluginManager')),
  logger: di => new Logger(di.get('queueManager')),
  pluginManager: di => new PluginManager(di),
  queueManager: di =>
    new QueueManager(di.get('eventDispatcher'), di.get('formatter'), di.get('writer'), {
      threshold: di.options.threshold,
      cloneData: di.options.cloneData,
      gc: di.options.gc,
    }),
  writer: di => new Writer(di.options.logDir),
  debugr: di =>
    new Debugr(
      di.get('eventDispatcher'),
      di.get('pluginManager'),
      di.createFactory('logger'),
      di.options.plugins,
    ),
};
