import { Logger } from '@debugr/core';
import { Response } from 'express';
import { NormalizedOptions } from '../types';
import {
  isCaptureEnabled,
  normalizeContentLength,
  normalizeContentType,
  filterHeaders,
} from '../utils';
import { captureResponseBody } from './captureStream';

export async function logHttpResponse(
  logger: Logger,
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
  const level = response.statusCode >= (options.e4xx ? 400 : 500) ? Logger.ERROR : options.level;

  logger.log('http', level, {
    type: 'response',
    status: response.statusCode,
    message: response.statusMessage,
    headers: filterHeaders(headers, options.response.excludeHeaders),
    body: canCapture ? body : undefined,
    bodyLength,
    lengthMismatch,
  });
}
