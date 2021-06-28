import { dim, yellow } from 'ansi-colors';
import { OutgoingHttpHeaders } from 'http';
import { formatHeadersMap, formatLength } from '../utils';

export function request(
  method: string,
  uri: string,
  headers: OutgoingHttpHeaders,
  ip?: string,
  bodyLength?: number,
  lengthMismatch?: boolean,
): string {
  const parts: string[] = [
    `${method.toUpperCase()} ${decodeURIComponent(uri)}`,
    dim(formatHeadersMap(headers)),
    '',
  ];

  if (ip) {
    parts.push(dim(`Client IP: ${ip}`));
  }

  if (bodyLength !== undefined) {
    const suffix = lengthMismatch ? yellow('; content-length mismatch!') : '';
    parts.push(dim(`Body: ${formatLength(bodyLength)}${suffix}`));
  }

  return parts.join('\n').trim();
}
