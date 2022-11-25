import type { LogLevel } from '@debugr/core';
import type { HeaderFilter } from '@debugr/http-common';

export type InsanerCollectorOptions = {
  level?: LogLevel;
  errorLevel?: LogLevel;
  e4xx?: boolean;
  excludeHeaders?: string[];
  request?: {
    excludeHeaders?: string[];
  };
  response?: {
    excludeHeaders?: string[];
  };
};

export type NormalizedOptions = {
  level: LogLevel;
  errorLevel: LogLevel;
  e4xx: boolean;
  request: {
    filterHeaders: HeaderFilter;
  };
  response: {
    filterHeaders: HeaderFilter;
  };
};
