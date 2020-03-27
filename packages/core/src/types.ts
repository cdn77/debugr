import { GcOptions } from './queues';
import { Plugin } from './plugins';

export type Options = {
  logDir: string;
  threshold?: number;
  cloneData?: boolean;
  writeDuplicates?: boolean;
  gc?: GcOptions;
  plugins?: Plugin[];
};

export enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  WARNING = 3,
  ERROR = 4,
}

export type With<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
