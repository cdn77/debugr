// noinspection CssInvalidPropertyValue

export class StylesTemplate {
  readonly levelMap: Map<number, string>;

  readonly colorMap: Map<number, string>;

  constructor(levelMap: Map<number, string>, colorMap: Map<number, string>) {
    this.levelMap = levelMap;
    this.colorMap = colorMap;
  }

  public render(totalTasks: number, maxParallelTasks: number): string {
    const tasks = totalTasks > 1 ? new Array(totalTasks).fill(null).map((_, i) => i) : [];
    const levels = [...this.levelMap.values()];
    const levelColors = [...this.colorMap.entries()]
      .filter(([k]) => this.levelMap.has(k))
      .map(([k, v]) => [this.levelMap.get(k)!, v]);

    return `
    <style>
      *, *:before, *:after {
        box-sizing: border-box;
      }

      body, html {
        width: 100vw;
        margin: 0;
        padding: 0;
        font: 13px/17px 'Source Code Pro', 'Helvetica Neue', 'Helvetica', sans-serif;
        background: #fff;
        color: #444;
      }

      header {
        padding: 2em;
        color: #fff;
      }

      header.bg-info {
        color: #444;
      }

      main {
        padding: 1em 2em 2em;
      }

      pre {
        flex: 1 1 auto;
        max-height: 90vh;
        margin: 1em 0;
        padding: 0.25em;
        border-radius: 0.25em;
        background: #fec;
        overflow: auto;
      }

      pre > code {
        display: block;
      }

      code, .mono {
        font-family: monospace;
      }

      small {
        color: #777;
      }

      input, label, summary {
        cursor: pointer;
        outline: none;
        user-select: none;
      }

      input {
        position: absolute;
        left: -100vw;
        top: -100vw;
        opacity: 0;
      }

      label > i {
        display: inline-block;
        width: 1.25em;
        height: 1.25em;
        margin: -3px 0.25em 0;
        border-radius: 3px;
        font-style: normal;
        text-align: center;
        vertical-align: middle;
      }

      .spacer {
        display: inline-block;
        width: 2em;
      }

${generateRules('      .bg-% { background: %; }', levelColors)}
      .bg-grey { background: #bbb; }

      .controls {
        position: sticky;
        top: 0;
        z-index: 2;
        padding: 0.5em 0;
        background: #fff;
      }

      .entries {
        margin: 1em 0 2em;
        border-top: 1px dotted #777;
      }

      .entry {
        display: flex;
        flex-flow: row nowrap;
        border-bottom: 1px dotted #777;
      }

      .entry.entry-meta {
        height: 60px;
      }

      .entry-tasks {
        position: relative;
        flex: 0 0 ${20 + (maxParallelTasks - 1) * 15}px;
      }

      .entry-tasks svg {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }

      .entry-tasks path {
        stroke: #777;
        stroke-dasharray: 1, 1;
        fill: none;
      }

      .entry-tasks circle {
        stroke: #777;
        stroke-width: 2;
        fill: #fff;
      }

      .entry-tasks text {
        text-anchor: middle;
        font-size: 10px;
        fill: #888;
      }

      .entry.defining-entry .entry-tasks circle {
        stroke: #f00;
      }

      .entry-time {
        flex: 0 0 100px;
        padding: 1em;
      }

      .entry-label {
        flex: 0 0 150px;
        padding: 1em;
      }

      .entry-content {
        flex: 1 1 auto;
        min-width: 0;
        padding: 1em;
      }

      .entry-content > *:first-child {
        margin-top: 0;
      }

      .entry-content > *:last-child {
        margin-bottom: 0;
      }

      .entry-content > pre:first-child {
        margin-top: -0.25em;
      }

      .entry-content > pre:last-child, .entry-content > *:last-child > pre:last-child {
        margin-bottom: -0.25em;
      }

${generateRules('      .entry.entry-% .entry-label { background: %; }', levelColors)}

      .text-muted {
        color: #777;
      }

${generateRules(
  `      #toggle-%:checked ~ .controls label[for="toggle-%"] i::before { content: '✔'; }`,
  levels,
)}
${generateRules('      #toggle-%:not(:checked) ~ .entries .entry-% { display: none; }', levels)}

${generateRules(
  `      #toggle-task-%:checked ~ .controls label[for="toggle-task-%"] i::before { content: '✔'; }`,
  tasks,
)}
${generateRules('      #toggle-task-%:not(:checked) ~ .entries .task-% { display: none; }', tasks)}
    </style>`;
  }
}

function generateRules(template: string, values: any[]): string {
  const rules: string[] = [];

  for (const value of values) {
    const arr = Array.isArray(value);
    let i = 0;
    rules.push(template.replace(/%/g, () => (arr ? value[i++] : value)));
  }

  return rules.join('\n');
}
