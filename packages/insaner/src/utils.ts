import { LogLevel } from '@debugr/core';
import { OutgoingHttpHeaders } from 'http';
import {
  CaptureBodyOption,
  NormalizedCaptureBodyOption,
  NormalizedOptions,
  Options,
} from './types';

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

function normalizeCaptureOption(option?: CaptureBodyOption): NormalizedCaptureBodyOption {
  if (typeof option === 'boolean' || typeof option === 'number' || option === undefined) {
    return option || false;
  } else if (typeof option === 'string' || Array.isArray(option)) {
    return normalizeTypePattern(option);
  } else {
    const map = new Map<RegExp, number>();

    for (const [type, length] of Object.entries(option)) {
      const pattern = normalizeTypePattern(type);
      pattern && map.set(pattern, length);
    }

    return map;
  }
}

export function isCaptureEnabled(
  option: NormalizedCaptureBodyOption,
  contentType?: string,
  contentLength?: number,
): boolean {
  if (typeof option === 'boolean') {
    return option;
  } else if (typeof option === 'number') {
    return contentLength !== undefined && contentLength <= option;
  } else {
    if (contentType === undefined) {
      return false;
    }

    if (option instanceof Map) {
      if (contentLength === undefined) {
        return false;
      }

      for (const [pattern, length] of option) {
        if (pattern.test(contentType)) {
          return contentLength <= length;
        }
      }

      return false;
    } else {
      return option.test(contentType);
    }
  }
}

function normalizeTypePattern(str: string | string[]): RegExp | false {
  if (!str.length) {
    return false;
  }

  const types = Array.isArray(str) ? str : str.split(/\s*,\s*|\s+/g);
  const patterns = types.map((type) =>
    type
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\*/g, '.+'),
  );
  return new RegExp(`^(?:${patterns.join('|')})$`);
}

export function normalizeContentType(type?: number | string | string[]): string | undefined {
  const value = Array.isArray(type) ? type[0] : typeof type === 'number' ? type.toString() : type;
  return value ? value.replace(/\s*;.*$/, '').toLowerCase() : undefined;
}

export function normalizeContentLength(length?: number | string | string[]): number | undefined {
  const value = Array.isArray(length) ? length[0] : length;
  return typeof value === 'string' ? parseInt(value, 10) : value;
}

function normalizeHeaderPattern(headers?: string[]): RegExp | undefined {
  if (!headers || !headers.length) {
    return undefined;
  }

  const patterns = headers.map((header) => header.replace(/[.*+?^${}()|[\]\\]/g, '$&'));
  return new RegExp(`^(?:${patterns.join('|')})$`, 'i');
}

export function filterHeaders(headers: OutgoingHttpHeaders, exclude?: RegExp): OutgoingHttpHeaders {
  if (!exclude) {
    return headers;
  }

  const filtered = { ...headers };

  for (const header of Object.keys(filtered)) {
    if (exclude.test(header)) {
      filtered[header] = '**redacted**';
    }
  }

  return filtered;
}
