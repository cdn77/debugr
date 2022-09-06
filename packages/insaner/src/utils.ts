import { LogLevel } from '@debugr/core';
import { createHttpHeadersFilter } from '@debugr/http-common';
import type { NormalizedOptions, Options } from './types';

export function normalizeOptions({
  level,
  e4xx,
  excludeHeaders,
  request,
  response,
}: Options = {}): NormalizedOptions {
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
