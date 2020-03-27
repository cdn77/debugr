import { OutgoingHttpHeaders } from 'http';
import { escapeHtml } from '@debugr/core';
import { formatBody, formatHeaders } from './utils';

export function request(
  method: string,
  uri: string,
  headers: OutgoingHttpHeaders,
  ip?: string,
  body?: string,
  bodyLength?: number,
  lengthMismatch?: boolean,
): string {
  const url = decodeURIComponent(uri);
  const details = ip
    ? `<p class="text-muted"><small><strong>Client IP:</strong> ${ip}</small></p>`
    : '';

  return `
    <p class="mono"><strong>${escapeHtml(method.toUpperCase())}</strong> ${escapeHtml(url)}</p>
    ${formatHeaders(headers)}
    ${formatBody(body, bodyLength, lengthMismatch, headers['content-type'])}
    ${details}
  `;
}
