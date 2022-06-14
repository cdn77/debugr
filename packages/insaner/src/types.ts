export type CaptureBodyOption = boolean | number | string | string[] | Record<string, number>;

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

export type NormalizedCaptureBodyOption = boolean | number | RegExp | Map<RegExp, number>;

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
