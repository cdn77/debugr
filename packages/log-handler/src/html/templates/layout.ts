import { LayoutTemplate } from '../../../../core/src/formatter/types';
import { escapeHtml } from '../../../../core/src/formatter/utils';
import { styles } from './styles';

export const layout: LayoutTemplate = (level, title, content) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    ${styles()}
  </head>
  <body>
    <header class="bg-${level}">
      <h1>${escapeHtml(title)}</h1>
    </header>
    <main>
      <input type="checkbox" id="toggle-error" checked /> <label for="toggle-error" class="bg-error">Errors</label>
      <input type="checkbox" id="toggle-warning" checked /> <label for="toggle-warning" class="bg-warning">Warnings</label>
      <input type="checkbox" id="toggle-info" checked /> <label for="toggle-info" class="bg-info">Info</label>
      <input type="checkbox" id="toggle-debug" checked /> <label for="toggle-debug" class="bg-debug">Debug</label>

      <div class="entry spacer"></div>

      ${content}
    </main>
  </body>
</html>
`;
