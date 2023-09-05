import { LogLevel } from '@debugr/core';
import { createHttpCaptureChecker, createHttpHeadersFilter } from '@debugr/http-common';
import type { InsanerCollectorOptions, NormalizedOptions } from './types';

export function normalizeOptions({
  level,
  errorLevel,
  uncaughtLevel,
  e4xx,
  captureBody,
  excludeHeaders,
  request,
  response,
}: InsanerCollectorOptions = {}): NormalizedOptions {
  return {
    level: level ?? LogLevel.INFO,
    errorLevel: errorLevel ?? LogLevel.ERROR,
    uncaughtLevel: uncaughtLevel ?? errorLevel ?? LogLevel.ERROR,
    e4xx: e4xx ?? false,
    request: {
      isCaptureEnabled: createHttpCaptureChecker(
        request?.captureBody ?? captureBody ?? { 'text/*, application/json': 2e6 },
      ),
      filterHeaders: createHttpHeadersFilter(
        request?.excludeHeaders ?? excludeHeaders ?? ['Authorization', 'Cookie'],
      ),
    },
    response: {
      isCaptureEnabled: createHttpCaptureChecker(
        response?.captureBody ?? captureBody ?? { 'text/*, application/json': 2e6 },
      ),
      filterHeaders: createHttpHeadersFilter(
        response?.excludeHeaders ?? excludeHeaders ?? ['Set-Cookie'],
      ),
    },
  };
}
