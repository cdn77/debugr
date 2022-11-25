import { LogLevel } from '@debugr/core';
import { createHttpCaptureChecker, createHttpHeadersFilter } from '@debugr/http-common';
import type { ExpressCollectorOptions, NormalizedOptions } from './types';

export function normalizeOptions({
  level,
  errorLevel,
  e4xx,
  excludeHeaders,
  captureBody,
  request,
  response,
}: ExpressCollectorOptions = {}): NormalizedOptions {
  return {
    level: level ?? LogLevel.INFO,
    errorLevel: errorLevel ?? LogLevel.ERROR,
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
