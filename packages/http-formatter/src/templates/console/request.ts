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
    formatHeadersMap(headers),
    '',
  ];

  if (ip) {
    parts.push(`Client IP: ${ip}`);
  }

  if (bodyLength !== undefined) {
    const suffix = lengthMismatch ? `; content-length mismatch!` : '';
    parts.push(`Body: ${formatLength(bodyLength)}${suffix}`);
  }

  return parts.join('\n').trim();
}
