import { EventDispatcher } from '../events';
import { ConsoleFormatter, HtmlFormatter } from '../formatter';
import { PluginManager } from '../plugins';
import { FullGcOptions, QueueManager, Writer } from '../queues';
import { Container } from '../di';
import { ConsoleLogger, Logger } from '../logger';
import { Debugr } from './debugr';
import { ForkOptions, GlobalOptions, Options } from '../types';

export interface Services {
  container: Container;
  eventDispatcher: EventDispatcher;
  htmlFormatter: HtmlFormatter;
  consoleFormatter: ConsoleFormatter;
  logger: Logger;
  consoleLogger: ConsoleLogger;
  pluginManager: PluginManager;
  queueManager: QueueManager;
  writer: Writer;
  debugr: Debugr;
}

export type FullOptions = Readonly<
  Required<Pick<Options, 'plugins'>> & {
    global: Readonly<Required<GlobalOptions>>;
    fork: Readonly<Required<Omit<ForkOptions, 'gc'>> & { gc: FullGcOptions }>;
  }
>;
