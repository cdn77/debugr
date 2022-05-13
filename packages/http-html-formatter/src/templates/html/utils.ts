import { OutgoingHttpHeaders } from 'http';
import { escapeHtml } from '@debugr/core';
import { formatHeadersMap, formatLength } from '../utils';

export function formatHeaders(headers: OutgoingHttpHeaders): string {
  return `
    <details>
      <summary>Headers:</summary>
      <pre>${escapeHtml(formatHeadersMap(headers))}</pre>
    </details>
  `;
}

export function formatBody(
  body: any,
  length?: number,
  lengthMismatch?: boolean,
  contentType?: number | string | string[],
): string {
  if (!body && !length) {
    return '';
  }

  const caption = `Body${formatLengthInfo(length, lengthMismatch)}:`;

  if (!body) {
    return `<p>${caption} omitted</p>`;
  }

  return `
    <details>
      <summary>${caption}</summary>
      <pre>${formatBodyContents(body, contentType)}</pre>
    </details>
  `;
}

function formatBodyContents(body: any, contentType?: number | string | string[]): string {
  return isJSON(contentType) ? `<code class="json">${escapeHtml(body)}</code>` : escapeHtml(body);
}

function formatLengthInfo(length?: number, mismatch?: boolean): string {
  if (length === undefined) {
    return '';
  }

  const prefix = mismatch ? 'real: ' : '';
  const suffix = mismatch ? '; content-length mismatch!' : '';
  return ` <small class="text-muted">(${prefix}${formatLength(length)}${suffix})</small>`;
}

function isJSON(contentType?: number | string | string[]): boolean {
  return typeof contentType === 'string' && /^application\/json(?:;|$)/.test(contentType);
}
