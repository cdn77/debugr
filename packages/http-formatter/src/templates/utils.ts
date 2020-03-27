import { OutgoingHttpHeaders } from 'http';
import { escapeHtml } from '@debugr/core';

export function formatHeaders(headers: OutgoingHttpHeaders): string {
  return `
    <details>
      <summary>Headers:</summary>
      <pre>${escapeHtml(formatHeadersContents(headers))}</pre>
    </details>
  `;
}

function formatHeadersContents(headers: OutgoingHttpHeaders): string {
  return Object.entries(headers)
    .map(([header, value]) =>
      Array.isArray(value) ? `${header}: ${value.join(`\n${header}: `)}` : `${header}: ${value}`,
    )
    .join('\n');
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

function formatLength(bytes: number): string {
  if (bytes >= 1e9) {
    return `${(bytes / 1e9).toFixed(2)} GB`;
  } else if (bytes >= 1e6) {
    return `${(bytes / 1e6).toFixed(2)} MB`;
  } else if (bytes >= 1e3) {
    return `${(bytes / 1e3).toFixed(2)} KB`;
  } else {
    return `${bytes} B`;
  }
}

function isJSON(contentType?: number | string | string[]): boolean {
  return typeof contentType === 'string' && /^application\/json(?:;|$)/.test(contentType);
}
