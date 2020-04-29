import { LogLevel, Options } from '../types';
import { FullOptions } from './types';

export function normalizeOptions(options: Options): FullOptions {
  return {
    threshold: LogLevel.ERROR,
    cloneData: false,
    plugins: [],
    ...options,
    gc: {
      interval: 60,
      threshold: 300,
      ...(options.gc || {}),
    },
  };
}

export function generateIdentifier(registry: Record<string, any>): string {
  let id: string;

  do {
    id =
      Date.now().toString(16) +
      Math.random()
        .toString(16)
        .substring(2, 6);
  } while (id in registry);

  return id;
}
