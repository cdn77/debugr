import type { SqlQueryFormatter } from './types';

export function createQueryFormatter(): SqlQueryFormatter {
  try {
    // oxlint-disable-next-line typescript/no-require-imports
    const { format } = require('@sqltools/formatter');
    return (query) => format(query, { language: 'sql', reservedWordCase: 'upper' });
  } catch {
    return (query) => query;
  }
}

export function formatQueryTime(ms: number, html: boolean = false): string {
  const value = ms > 1000 ? ms / 1000 : ms;
  const unit = ms > 1000 ? 's' : 'ms';
  const [p, s] = html ? ['<strong>', '</strong>'] : ['', ''];
  return `${p}${value.toFixed(2)}${s} ${unit}`;
}
