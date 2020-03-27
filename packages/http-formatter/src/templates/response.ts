import { OutgoingHttpHeaders } from 'http';
import { escapeHtml as esc } from '@debugr/core';
import { formatBody, formatHeaders } from './utils';

export function response(
  status: number,
  message: string,
  headers: OutgoingHttpHeaders,
  body?: string,
  bodyLength?: number,
  lengthMismatch?: boolean,
): string {
  return `
    <p class="mono"><strong>${esc(status.toString())} ${esc(message || '')}</strong></p>
    ${formatHeaders(headers)}
    ${formatBody(body, bodyLength, lengthMismatch, headers['content-type'])}
`;
}
