const entityMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return `${str}`.replace(/[&<>"']/g, (c) => entityMap[c]);
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
