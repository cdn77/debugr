import { LogEntry } from '../queues';

export function isEmpty(o: Record<string, any> | undefined): boolean {
  return !o || !Object.keys(o).length;
}

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

export function indent(str: string, level: number = 1): string {
  const indent: string = Array(level).fill('  ').join('');
  return unindent(str).replace(/^(?!$)/gm, indent);
}

export function unindent(str: string): string {
  const indents = [...str.matchAll(/^[ ]+(?!$)/gm)]
    .map((indent) => indent[0])
    .sort((a, b) => a.length - b.length);
  const pattern = indents.length ? `^(?:\\s+$|${indents[0]})` : '^\\s+$';
  return str.replace(new RegExp(pattern, 'mg'), '');
}

export function pad(n: number): string | number {
  return n > 9 ? n : `0${n}`;
}

export function pad3(n: number): string | number {
  return n > 99 ? n : `0${pad(n)}`;
}

export function formatDate(ts: number, relativeTo?: number): string {
  const d = new Date(ts);
  const str = `${!relativeTo ? `${d.getDate()}/${d.getMonth() + 1} ${d.getFullYear()} ` : ''}${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}<small>.${pad3(d.getMilliseconds())}</small>`;

  return relativeTo ? `${str} <small>(+${d.getTime() - relativeTo}ms)</small>` : str;
}

export function formatData(data: any): string {
  const visited: any[] = [];
  return formatValue(data);

  function formatValue(value: any): string {
    if (visited.includes(value)) {
      return '**RECURSION**';
    } else if (isObject(value)) {
      visited.push(value);
    }

    if (value === undefined) {
      return 'undefined';
    } else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      return JSON.stringify(value);
    } else if (typeof value === 'string') {
      return value.indexOf('\n') > -1 ? `|\n${indent(value)}` : value;
    } else if (Array.isArray(value)) {
      return !value.length
        ? '[]'
        : value
            .map((v) => {
              const o = formatValue(v);
              return `- ${isObject(v) || isMultiline(o) ? indent(o).trimLeft() : o}`;
            })
            .join('\n');
    } else if (typeof value === 'function') {
      return value.name
        ? `function ${value.name}(${value.length})`
        : `anonymous function(${value.length})`;
    } else if (typeof value.toJSON === 'function') {
      return formatValue(value.toJSON());
    } else {
      const pairs = Object.entries(value);

      return !pairs.length
        ? '{}'
        : pairs
            .map(([k, v]) => {
              const o = formatValue(v);
              return `${k}:${isObject(v) || isMultiline(o) ? `\n${indent(o)}` : ` ${o}`}`;
            })
            .join('\n');
    }
  }

  function indent(str: string): string {
    return str.replace(/^/gm, '  ');
  }

  function isObject(value: any): value is object {
    return typeof value === 'object' && value !== null;
  }

  function isMultiline(value: string): boolean {
    return value.includes('\n');
  }
}

export function extractEntryTitle(entry: LogEntry, levelMap: Record<number, string>): string {
  if (entry.message) {
    return entry.message;
  } else {
    return `Unknown ${levelMap[entry.level]}`;
  }
}

export function formatStack(stack: string): string {
  return `
    <details>
      <summary>Stack trace:</summary>
      <pre><code>${escapeHtml(stack)}</code></pre>
    </details>
  `;
}

export function formatDefaultContent(message?: string, data?: any): string {
  const { stack, ...otherData } = data || {};
  const formattedData = !isEmpty(otherData)
    ? `<pre><code>${escapeHtml(formatData(otherData))}</code></pre>`
    : null;

  const wrappedData = () => `
    <details>
      <summary>Data:</summary>
      ${formattedData}
    </details>
  `;

  return `
    ${message ? `<p>${escapeHtml(message)}</p>` : ''}
    ${formattedData ? (!message ? formattedData : wrappedData()) : ''}
    ${typeof stack === 'string' ? formatStack(stack) : ''}
  `;
}
