import type { HeaderFilter } from '@debugr/http-common';

export type Options = {
  level?: number;
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
  level: number;
  e4xx: boolean;
  request: {
    filterHeaders: HeaderFilter;
  };
  response: {
    filterHeaders: HeaderFilter;
  };
};
