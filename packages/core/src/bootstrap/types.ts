// import { EventDispatcher } from '../events';
import { PluginManager } from '../plugins';
import { Container } from '../di';
import { Logger } from '../logger';
import { Debugr } from './debugr';
import { ForkOptions, GlobalOptions, Options } from '../types';

export interface Services {
  container: Container;
  // eventDispatcher: EventDispatcher;
  logger: Logger;
  pluginManager: PluginManager;
  debugr: Debugr;
}

export type FullOptions = Readonly<
  Required<Pick<Options, 'plugins'>> & {
    global: Readonly<Required<GlobalOptions>>;
    fork: Readonly<Required<Omit<ForkOptions, 'gc'>> & { gc: {} }>;
  }
>;
