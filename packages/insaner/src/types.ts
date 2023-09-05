import type { LogLevel } from '@debugr/core';
import type { CaptureBodyChecker, CaptureBodyOption, HeaderFilter } from '@debugr/http-common';

export type InsanerCollectorOptions = {
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
