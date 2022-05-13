import { OutgoingHttpHeaders } from 'http';

export function formatHeadersMap(headers: OutgoingHttpHeaders): string {
  return Object.entries(headers)
    .map(([header, value]) =>
      Array.isArray(value) ? `${header}: ${value.join(`\n${header}: `)}` : `${header}: ${value}`,
    )
    .join('\n');
}

export function formatLength(bytes: number): string {
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
