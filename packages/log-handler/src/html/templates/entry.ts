import { escapeHtml, EntryTemplate } from '@debugr/core';

export const entry: EntryTemplate = (ts, level, label, content) => {
  return `
    <div class="entry entry-${level}">
      <div class="entry-time">${ts}</div>
      <div class="entry-label">${escapeHtml(label)}</div>
      <div class="entry-content">
        ${content}
      </div>
    </div>
  `;
};
