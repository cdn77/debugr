import ErrorStackParser from 'error-stack-parser';
import type { SentryDsn } from './types';

const dsnPattern = /^([^:]+):\/\/(?:([^:]+)(?::(.+))?@)?(.+)\/([^/]+)$/;

export function parseDsn(dsn?: string): SentryDsn | undefined {
  if (!dsn) {
    return undefined;
  }

  const m = dsn.match(dsnPattern);

  if (!m) {
    throw new Error('Invalid Sentry DSN');
  }

  return {
    baseUri: `${m[1]}://${m[4]}/api/${m[5]}`,
    publicKey: m[2],
    secretKey: m[3] === '' ? undefined : m[3],
  };
}

export function parseStackTrace(error: Error): Record<string, any>[] {
  return ErrorStackParser.parse(error).map((frame) => ({
    filename: frame.fileName,
    function: frame.functionName,
    lineno: frame.lineNumber,
    colno: frame.columnNumber,
  }));
}
