import { LogEntry, TContextBase, TContextShape } from '@debugr/core';
import { OutgoingHttpHeaders } from 'http';

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

export interface HttpLogEntry<
  TTaskContext extends TContextBase = TContextShape,
  TGlobalContext extends TContextShape = {},
> extends LogEntry<Partial<TTaskContext>, TGlobalContext> {
  format: 'http';
  data: {
    type: string;
    status?: number;
    message?: string;
    headers: OutgoingHttpHeaders;
    body?: string;
    bodyLength?: number;
    lengthMismatch?: boolean;
    method?: string;
    uri?: string;
    ip?: string;
  };
}
