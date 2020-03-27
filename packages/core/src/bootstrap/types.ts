import { EventDispatcher } from '../events';
import { Formatter } from '../formatter';
import { PluginManager } from '../plugins';
import { FullGcOptions, QueueManager, Writer } from '../queues';
import { Container } from '../di';
import { Logger } from '../logger';
import { Debugr } from './debugr';
import { Options } from '../types';

export interface Services {
  container: Container;
  eventDispatcher: EventDispatcher;
  formatter: Formatter;
  logger: Logger;
  pluginManager: PluginManager;
  queueManager: QueueManager;
  writer: Writer;
  debugr: Debugr;
}

export type FullOptions = Readonly<Required<Omit<Options, 'gc'>> & { gc: FullGcOptions }>;
