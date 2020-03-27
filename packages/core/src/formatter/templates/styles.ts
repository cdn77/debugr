const colorMap: Record<string, string> = {
  debug: '#c8edff',
  info: '#ffffaa',
  warning: '#ffaa00',
  error: '#ff4444',
  internal: '#da47ff',
  unknown: '#4747ff',
};

function generateColorMap(selector: string): string {
  return Object.entries(colorMap)
    .map(
      ([level, color]) =>
        `${selector.replace(/%/g, level)} {
        background: ${color};
       }`,
    )
    .join('\n\n       ');
}

export function styles(): string {
  return `
    <style type="text/css">
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
        padding: 2em;
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

      ${generateColorMap('.bg-%')}

      .entry {
        display: flex;
        flex-flow: row nowrap;
        border-bottom: 1px dotted #777;
      }

      .spacer {
        height: 2em;
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

      ${generateColorMap('.entry.entry-% .entry-label')}

      .text-muted {
        color: #777;
      }

      #toggle-error:not(:checked) ~ .entry.entry-error {
        display: none;
      }

      #toggle-warning:not(:checked) ~ .entry.entry-warning {
        display: none;
      }

      #toggle-info:not(:checked) ~ .entry.entry-info {
        display: none;
      }

      #toggle-debug:not(:checked) ~ .entry.entry-debug {
        display: none;
      }
    </style>
  `;
}
