import { Options } from '../types';
import { Debugr } from './debugr';
import { Container } from '../di';
import { normalizeOptions } from './utils';
import { defaultFactories } from './defaultFactories';

export { Services } from './types';

export function debugr(options: Options): Debugr {
  const container = new Container(normalizeOptions(options), defaultFactories);
  return container.get('debugr');
}
