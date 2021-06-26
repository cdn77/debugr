import { EventDispatcher } from '../events';
import { ConsoleFormatter, HtmlFormatter } from '../formatter';
import { PluginManager } from '../plugins';
import { QueueManager, Writer } from '../queues';
import { ConsoleLogger, Logger } from '../logger';
import { FactoryMap } from '../di';
import { FullOptions, Services } from './types';
import { Debugr } from './debugr';

export const defaultFactories: FactoryMap<Services, FullOptions> = {
  container: (di) => di,
  eventDispatcher: () => new EventDispatcher(),
  consoleFormatter: (di) => new ConsoleFormatter(di.get('pluginManager')),
  htmlFormatter: (di) => new HtmlFormatter(di.get('pluginManager')),
  logger: (di) => new Logger(di.get('queueManager'), di.get('consoleLogger')),
  consoleLogger: (di) => new ConsoleLogger(di.get('consoleFormatter'), di.options.global.threshold),
  pluginManager: (di) => new PluginManager(di),
  queueManager: (di) =>
    new QueueManager(di.get('eventDispatcher'), di.get('htmlFormatter'), di.get('writer'), {
      threshold: di.options.fork.threshold,
      cloneData: di.options.fork.cloneData,
      gc: di.options.fork.gc,
    }),
  writer: (di) => new Writer(di.options.fork.logDir),
  debugr: (di) =>
    new Debugr(
      di.get('eventDispatcher'),
      di.get('pluginManager'),
      di.createAccessor('logger'),
      di.options.plugins,
    ),
};
