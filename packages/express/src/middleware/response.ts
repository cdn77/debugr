import { Logger, LogLevel, TContextBase } from '@debugr/core';
import { Response } from 'express';
import { NormalizedOptions } from '../types';
import {
  isCaptureEnabled,
  normalizeContentLength,
  normalizeContentType,
  filterHeaders,
} from '../utils';
import { captureResponseBody } from './captureStream';

export async function logHttpResponse<
  TContext extends TContextBase = { processId: string },
  TGlobalContext extends Record<string, any> = {},
>(
  logger: Logger<Partial<TContext>, TGlobalContext>,
  options: NormalizedOptions,
  response: Response,
): Promise<void> {
  const body = await captureResponseBody(response);
  const headers = response.getHeaders();
  const contentType = normalizeContentType(headers['content-type']);
  const contentLength = normalizeContentLength(headers['content-length']);
  const canCapture = isCaptureEnabled(options.response.captureBody, contentType, contentLength);
  const bodyLength = body ? body.length : undefined;
  const lengthMismatch =
    bodyLength !== undefined && contentLength !== undefined && bodyLength !== contentLength;
  const level = response.statusCode >= (options.e4xx ? 400 : 500) ? LogLevel.ERROR : options.level;

  logger.add({
    pluginId: 'http',
    level,
    data: {
      type: 'response',
      status: response.statusCode,
      message: response.statusMessage,
      headers: filterHeaders(headers, options.response.excludeHeaders),
      body: canCapture ? body : undefined,
      bodyLength,
      lengthMismatch,
    },
  });
}
