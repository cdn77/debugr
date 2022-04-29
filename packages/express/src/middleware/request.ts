import { Logger } from '@debugr/core';
import { Request } from 'express';
import { NormalizedOptions } from '../types';
import {
  filterHeaders,
  isCaptureEnabled,
  normalizeContentLength,
  normalizeContentType,
} from '../utils';
import { captureRequestBody } from './captureStream';

export function logHttpRequest(logger: Logger, options: NormalizedOptions, request: Request): void {
  const contentType = normalizeContentType(request.header('content-type'));
  const contentLength = normalizeContentLength(request.header('content-length'));

  if (isCaptureEnabled(options.request.captureBody, contentType, contentLength)) {
    captureRequestBody(request, (err, body) =>
      doLogRequest(logger, options, request, contentType, contentLength, body),
    );
  } else {
    doLogRequest(logger, options, request, contentType, contentLength);
  }
}

function doLogRequest(
  logger: Logger,
  options: NormalizedOptions,
  request: Request,
  contentType?: string,
  contentLength?: number,
  body?: string,
): void {
  const bodyLength = body ? body.length : undefined;
  const canCapture = isCaptureEnabled(options.request.captureBody, contentType, bodyLength);
  const lengthMismatch = !!body && !canCapture;

  logger.pluginLog('http', options.level, {
    type: 'request',
    method: request.method,
    uri: request.originalUrl,
    headers: filterHeaders(request.headers, options.request.excludeHeaders),
    ip: request.ip,
    body: canCapture ? body : undefined,
    bodyLength,
    lengthMismatch,
  });
}
