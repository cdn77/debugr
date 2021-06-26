import { GcOptions } from './queues';
import { Plugin } from './plugins';

export type Options = {
  global?: GlobalOptions;
  fork?: ForkOptions;
  plugins?: Plugin[];
};

export type GlobalOptions = {
  threshold?: number;
};

export type ForkOptions = {
  logDir: string;
  threshold?: number;
  cloneData?: boolean;
  gc?: GcOptions;
};

export enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  WARNING = 3,
  ERROR = 4,
}

export type With<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
