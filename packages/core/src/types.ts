import { Plugin } from './plugins';

export type Options = {
  global?: GlobalOptions;
  fork?: ForkOptions;
  plugins?: Plugin[];
};

export type GlobalOptions = {
  threshold?: number;
  writeTimestamp?: boolean;
};

export type ForkOptions = {
  logDir: string;
  threshold?: number;
  cloneData?: boolean;
  gc?: {};
};

export type With<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
