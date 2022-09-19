import type { PluginManager } from '../pluginManager';
import type { FormatterPlugin, FormatterPluginTypeGuard } from '../types';

export function normalizeMap<V>(map: Record<number, V>): Map<number, V> {
  return new Map(
    Object.entries(map)
      .map(([level, value]) => [parseInt(level, 10), value] as const)
      .sort(([a], [b]) => a - b),
  );
}

export function levelToValue<V>(map: Map<number, V>, level: number, fallback?: number): V;
export function levelToValue<V, F>(map: Map<number, V>, level: number, fallback: F): V | F;
export function levelToValue<V>(map: Map<number, V>, level: number, fallback: any = 0): V | any {
  const exact = map.get(level);

  if (exact) {
    return exact;
  }

  for (const [l, v] of map.entries()) {
    if (level > l) {
      return v;
    }
  }

  return typeof fallback === 'number' ? map.get(fallback)! : fallback;
}

export function isEmpty(o: Record<string, any> | undefined): boolean {
  return !o || !Object.keys(o).length;
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

export function cleanUpStackTrace(trace: string): string {
  return trace.replace(/^.+\n/, '').replace(/^\s+/gm, ' ');
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

export function resolveFormatters<TFormatter extends FormatterPlugin>(
  pluginManager: PluginManager<any, any>,
  filter: FormatterPluginTypeGuard<TFormatter>,
  defaults: Record<string, () => TFormatter>,
): Record<string, TFormatter> {
  const formatters = Object.fromEntries(
    pluginManager.find(filter).map((plugin) => [plugin.entryType, plugin]),
  );

  for (const type of pluginManager.getKnownEntryTypes()) {
    if (!formatters[type]) {
      if (defaults[type]) {
        formatters[type] = defaults[type]();
        pluginManager.register(formatters[type]);
      } else {
        throw new Error(`Missing formatter for '${type}' entries`);
      }
    }
  }

  return formatters;
}
