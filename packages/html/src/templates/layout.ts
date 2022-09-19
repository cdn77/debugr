import { levelToValue } from '@debugr/core';
import { StylesTemplate } from './styles';
import { escapeHtml } from './utils';

export class LayoutTemplate {
  private readonly levelMap: Map<number, string>;
  private readonly colorMap: Map<number, string>;
  private readonly styles: StylesTemplate;

  public constructor(levelMap: Map<number, string>, colorMap: Map<number, string>) {
    this.levelMap = levelMap;
    this.colorMap = colorMap;
    this.styles = new StylesTemplate(levelMap, colorMap);
  }

  public render(
    level: number,
    title: string,
    usedLevels: number[],
    totalTasks: number,
    maxParallelTasks: number,
    content: string,
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    ${this.renderHead(level, title, totalTasks, maxParallelTasks)}
  </head>
  <body>
    ${this.renderHeader(level, title)}
    ${this.renderBody(usedLevels, totalTasks, content)}
  </body>
</html>
`;
  }

  protected renderHead(
    level: number,
    title: string,
    totalTasks: number,
    maxParallelTasks: number,
  ): string {
    return `<meta charset="utf-8" />
    <meta name="theme-color" content="${levelToValue(this.colorMap, level, '#fff')}" />
    <title>${escapeHtml(title)}</title>
    ${this.styles.render(totalTasks, maxParallelTasks)}`;
  }

  protected renderHeader(level: number, title: string): string {
    return `<header class="bg-${levelToValue(this.levelMap, level)}">
      <h1>${escapeHtml(title)}</h1>
    </header>`;
  }

  protected renderBody(usedLevels: number[], totalTasks: number, content: string): string {
    return `<main>
      ${this.renderControls(usedLevels, totalTasks)}

      <div class="entries">
        ${content}
      </div>
    </main>`;
  }

  protected renderControls(usedLevels: number[], totalTasks: number): string {
    const levels = [...this.levelMap.entries()]
      .filter(([level]) => usedLevels.includes(level))
      .map(([, name]) => name);

    const toggles = renderToggles(levels);
    const controls = ['Show:', ...levels.map((level) => renderControl(level))];

    if (totalTasks > 1) {
      const ids = new Array(totalTasks).fill(null).map((_, id) => id);

      toggles.push(...renderToggles(ids.map((id) => `task-${id}`)));
      controls.push(
        '<span class="spacer"></span>',
        'Tasks:',
        ...ids.map((id) => renderControl(`task-${id}`, 'grey', id || 'main')),
      );
    }

    return `${toggles.join('\n      ')}

      <div class="controls">
        ${controls.join('\n        ')}
      </div>`;
  }
}

function renderToggles(ids: (string | number)[]): string[] {
  return ids.map((id) => `<input type="checkbox" id="toggle-${id}" checked />`);
}

function renderControl(id: string | number, bg?: string, label?: string | number): string {
  return `<label for="toggle-${id}"><i class="bg-${bg ?? id}"></i> ${label ?? id}</label>`;
}
