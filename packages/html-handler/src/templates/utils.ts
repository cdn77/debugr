const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return `${str}`.replace(/[&<>"']/g, (c) => entityMap[c]);
}

export function formatBytes(bytes: number): string {
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

export function renderDetails(summary: string, content: string): string {
  return `<details>
              <summary>${summary}</summary>
              ${content}
            </details>`;
}

export function renderCode(content: string, className?: string): string {
  const attrs = className ? ` class="${className}"` : '';
  return `<pre><code${attrs}>${escapeHtml(content)}</code></pre>`;
}
