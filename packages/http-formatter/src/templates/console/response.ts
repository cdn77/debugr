import { OutgoingHttpHeaders } from 'http';
import { formatHeadersMap, formatLength } from '../utils';

export function response(
  status: number,
  message: string,
  headers: OutgoingHttpHeaders,
  bodyLength?: number,
  lengthMismatch?: boolean,
): string {
  const parts: string[] = [`HTTP ${status} ${message}`.trim(), formatHeadersMap(headers), ''];

  if (bodyLength !== undefined) {
    const suffix = lengthMismatch ? `; content-length mismatch!` : '';
    parts.push(`Body: ${formatLength(bodyLength)}${suffix}`);
  }

  return parts.join('\n').trim();
}
