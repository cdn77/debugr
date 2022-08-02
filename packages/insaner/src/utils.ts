import { LogLevel } from '@debugr/core';
import { normalizeCaptureOption, normalizeHeaderPattern } from '@debugr/http-common';
import { NormalizedOptions, Options } from './types';

export function normalizeOptions(options?: Options): NormalizedOptions {
  return {
    level: options?.level ?? LogLevel.INFO,
    e4xx: options?.e4xx ?? false,
    request: {
      captureBody: normalizeCaptureOption(
        options?.request?.captureBody ??
          options?.captureBody ?? { 'text/*, application/json': 2e6 },
      ),
      excludeHeaders: normalizeHeaderPattern(
        options?.request?.excludeHeaders ?? options?.excludeHeaders ?? ['Authorization', 'Cookie'],
      ),
    },
    response: {
      captureBody: normalizeCaptureOption(
        options?.response?.captureBody ??
          options?.captureBody ?? { 'text/*, application/json': 2e6 },
      ),
      excludeHeaders: normalizeHeaderPattern(
        options?.response?.excludeHeaders ?? options?.excludeHeaders ?? ['Set-Cookie'],
      ),
    },
  };
}
