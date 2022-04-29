import { escapeHtml } from '../../../../core/src/formatter/utils';
import { EntryTemplate } from '../../../../core/src/formatter/types';

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
