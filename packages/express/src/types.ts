import type { LogLevel } from '@debugr/core';
import type {
  CaptureBodyChecker,
  CaptureBodyOption,
  HeaderFilter,
  HttpHeaders,
} from '@debugr/http-common';

export type ExpressCollectorOptions = {
  level?: LogLevel;
  errorLevel?: LogLevel;
  uncaughtLevel?: LogLevel;
  e4xx?: boolean;
  captureBody?: CaptureBodyOption;
  excludeHeaders?: string[];
  request?: {
    captureBody?: CaptureBodyOption;
    excludeHeaders?: string[];
  };
  response?: {
    captureBody?: CaptureBodyOption;
    excludeHeaders?: string[];
  };
};

export type NormalizedOptions = {
  level: LogLevel;
  errorLevel: LogLevel;
  uncaughtLevel: LogLevel;
  e4xx: boolean;
  request: {
    isCaptureEnabled: CaptureBodyChecker;
    filterHeaders: HeaderFilter;
  };
  response: {
    isCaptureEnabled: CaptureBodyChecker;
    filterHeaders: HeaderFilter;
  };
};

export type ResponseInfo = {
  headers: HttpHeaders;
  contentLength?: number;
  body?: string;
  bodyLength: number;
};
