import { dim, yellow } from 'ansi-colors';
import { OutgoingHttpHeaders } from 'http';
import { formatHeadersMap, formatLength } from '../utils';

export function response(
  status: number,
  message: string,
  headers: OutgoingHttpHeaders,
  bodyLength?: number,
  lengthMismatch?: boolean,
): string {
  const parts: string[] = [`HTTP ${status} ${message}`.trim(), dim(formatHeadersMap(headers)), ''];

  if (bodyLength !== undefined) {
    const suffix = lengthMismatch ? yellow('; content-length mismatch!') : '';
    parts.push(dim(`Body: ${formatLength(bodyLength)}${suffix}`));
  }

  return parts.join('\n').trim();
}
