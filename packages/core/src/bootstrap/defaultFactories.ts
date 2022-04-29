// import { EventDispatcher } from '../events';
import { PluginManager } from '../plugins';
import { Logger } from '../logger';
import { FactoryMap } from '../di';
import { FullOptions, Services } from './types';
import { Debugr } from './debugr';

export const defaultFactories: FactoryMap<Services, FullOptions> = {
  container: (di) => di,
  // eventDispatcher: () => new EventDispatcher(),
  logger: () => new Logger([], {}),
  pluginManager: (di) => new PluginManager(di),
  debugr: (di) =>
    new Debugr(
      // di.get('eventDispatcher'),
      di.get('pluginManager'),
      di.createAccessor('logger'),
      di.options.plugins,
    ),
};
