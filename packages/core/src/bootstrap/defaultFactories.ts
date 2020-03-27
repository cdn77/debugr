import { EventDispatcher } from '../events';
import { Formatter } from '../formatter';
import { PluginManager } from '../plugins';
import { QueueManager, QueueWriter } from '../queues';
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
    new QueueManager(di.get('eventDispatcher'), {
      threshold: di.options.threshold,
      cloneData: di.options.cloneData,
      gc: di.options.gc,
    }),
  queueWriter: di => new QueueWriter(di.options.logDir),
  debugr: di => new Debugr(di),
};
