import { LogLevel } from '@debugr/core';
import { createHttpHeadersFilter } from '@debugr/http-common';
import type { InsanerCollectorOptions, NormalizedOptions } from './types';

export function normalizeOptions({
  level,
  e4xx,
  excludeHeaders,
  request,
  response,
}: InsanerCollectorOptions = {}): NormalizedOptions {
  return {
    level: level ?? LogLevel.INFO,
    e4xx: e4xx ?? false,
    request: {
      filterHeaders: createHttpHeadersFilter(
        request?.excludeHeaders ?? excludeHeaders ?? ['Authorization', 'Cookie'],
      ),
    },
    response: {
      filterHeaders: createHttpHeadersFilter(
        response?.excludeHeaders ?? excludeHeaders ?? ['Set-Cookie'],
      ),
    },
  };
}
