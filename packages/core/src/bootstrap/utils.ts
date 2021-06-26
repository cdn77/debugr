import { LogLevel, Options } from '../types';
import { FullOptions } from './types';

export function normalizeOptions({ global = {}, fork, plugins = [] }: Options): FullOptions {
  if (!fork || !fork.logDir) {
    throw new Error('Missing required option "fork.logDir"');
  }

  return {
    global: {
      threshold: LogLevel.INFO,
      ...global,
    },
    fork: {
      threshold: LogLevel.ERROR,
      cloneData: false,
      ...fork,
      gc: {
        interval: 60,
        threshold: 300,
        ...(fork.gc || {}),
      },
    },
    plugins,
  };
}

export function generateIdentifier(registry: Record<string, any>): string {
  let id: string;

  do {
    id = Date.now().toString(16) + Math.random().toString(16).substring(2, 6);
  } while (id in registry);

  return id;
}
