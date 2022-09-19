import type { ImmutableDate } from '@debugr/core';
import { levelToValue, pad, pad3 } from '@debugr/core';
import { escapeHtml } from './utils';

export class EntryTemplate {
  private readonly levelMap: Map<number, string>;

  public constructor(levelMap: Map<number, string>) {
    this.levelMap = levelMap;
  }

  public render(
    ts: string,
    level: number,
    content: string,
    label?: string,
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
          <div class="entry-label">${label ? escapeHtml(label) : ''}</div>
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
}
