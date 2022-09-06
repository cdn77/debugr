import type { LogEntry, TContextBase, TContextShape } from '@debugr/core';

export interface HttpHeaders {
  [header: string]: number | string | string[] | undefined;
}

export interface HttpRequestData {
  type: 'request';
  method: string;
  uri: string;
  headers?: HttpHeaders;
  ip?: string;
  body?: string;
  bodyLength?: number;
  lengthMismatch?: boolean;
}

export interface HttpResponseData {
  type: 'response';
  status: number;
  message?: string;
  headers?: HttpHeaders;
  body?: string;
  bodyLength?: number;
  lengthMismatch?: boolean;
}

export interface HttpLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  format: 'http';
  data: HttpRequestData | HttpResponseData;
}

export type HeaderFilter = (headers: HttpHeaders) => HttpHeaders;
export type CaptureBodyOption = boolean | number | string | string[] | Record<string, boolean | number>;
export type CaptureBodyChecker = (
  rawContentType?: number | string | string[],
  rawContentLength?: number | string | string[],
) => boolean;
