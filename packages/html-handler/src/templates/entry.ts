import { ImmutableDate, LogEntry, formatData, isEmpty, pad, pad3 } from '@debugr/core';
import { levelToValue } from '../utils';
import { escapeHtml, renderCode, renderDetails } from './utils';

export class EntryTemplate {
  readonly levelMap: Map<number, string>;

  constructor(levelMap: Map<number, string>) {
    this.levelMap = levelMap;
  }

  public render(
    ts: string,
    level: number,
    label: string,
    content: string,
    task?: number,
    defining: boolean = false,
    taskStates?: string,
  ): string {
    const classes: string[] = ['entry', `entry-${levelToValue(this.levelMap, level)}`];
    task !== undefined && classes.push(`task-${task}`);
    defining && classes.push('defining-entry');

    return `<div class="${classes.join(' ')}">
          ${taskStates ?? ''}
          <div class="entry-time">${ts}</div>
          <div class="entry-label">${escapeHtml(label)}</div>
          <div class="entry-content">
            ${content}
          </div>
        </div>`;
  }

  public renderMeta(ts: string, content: string, task?: number): string {
    const classes: string[] = ['entry', 'entry-meta'];
    task !== undefined && classes.push(`task-${task}`);

    return `<div class="${classes.join(' ')}">
          ${content}
          <div class="entry-time">${ts}</div>
        </div>`;
  }

  public formatTimestamp(ts: ImmutableDate, relativeTo?: ImmutableDate): string {
    const date = relativeTo ? '' : `${ts.getDate()}/${ts.getMonth() + 1} ${ts.getFullYear()} `;
    const time = `${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(ts.getSeconds())}`;
    const ms = `<small>.${pad3(ts.getMilliseconds())}</small>`;
    const str = `${date}${time}${ms}`;
    return relativeTo ? `${str} <small>(+${ts.getTime() - relativeTo.getTime()}ms)</small>` : str;
  }

  public renderStackTrace(trace: string): string {
    return renderDetails('Stack trace:', renderCode(trace));
  }

  public renderDefaultContent(entry: Pick<LogEntry, 'message' | 'data' | 'error'>): string {
    const { stack, ...data } = entry.data ?? {};
    const chunks: string[] = [];

    if (entry.error) {
      chunks.push(`<p>${escapeHtml(entry.error.message)}</p>`);

      if (entry.error.stack) {
        chunks.push(this.renderStackTrace(entry.error.stack));
      }
    }

    if (entry.message) {
      chunks.push(`<p>${escapeHtml(entry.message)}</p>`);
    }

    if (!isEmpty(data)) {
      const formattedData = renderCode(formatData(data));
      chunks.push(entry.message ? renderDetails('Data:', formattedData) : formattedData);
    }

    if (typeof stack === 'string') {
      chunks.push(this.renderStackTrace(stack));
    }

    return chunks.join('\n            ');
  }
}
