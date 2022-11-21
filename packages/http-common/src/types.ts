import type { LogEntry, TContextBase, TContextShape } from '@debugr/core';
import type { EntryType } from '@debugr/core';

declare module '@debugr/core' {
  export const enum EntryType {
    HttpRequest = 'http.request',
    HttpResponse = 'http.response',
  }
}

export interface HttpHeaders {
  [header: string]: number | string | string[] | undefined;
}

export interface HttpRequestData {
  method: string;
  uri: string;
  headers?: HttpHeaders;
  ip?: string;
  body?: string;
  bodyLength?: number;
  lengthMismatch?: boolean;
}

export interface HttpResponseData {
  status: number;
  message?: string;
  headers?: HttpHeaders;
  body?: string;
  bodyLength?: number;
  lengthMismatch?: boolean;
}

export interface HttpRequestLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  type: EntryType.HttpRequest;
  data: HttpRequestData;
}

export interface HttpResponseLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends LogEntry<TTaskContext, TGlobalContext> {
  type: EntryType.HttpResponse;
  data: HttpResponseData;
}

export type HeaderFilter = (headers: HttpHeaders) => HttpHeaders;
export type CaptureBodyOption =
  | boolean
  | number
  | string
  | string[]
  | Record<string, boolean | number>;
export type CaptureBodyChecker = (
  rawContentType?: number | string | string[],
  rawContentLength?: number | string | string[],
) => boolean;
