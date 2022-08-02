import { CaptureBodyOption, NormalizedCaptureBodyOption } from '@debugr/http-common';

export type Options = {
  level?: number;
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
  level: number;
  e4xx: boolean;
  request: {
    captureBody: NormalizedCaptureBodyOption;
    excludeHeaders?: RegExp;
  };
  response: {
    captureBody: NormalizedCaptureBodyOption;
    excludeHeaders?: RegExp;
  };
};
