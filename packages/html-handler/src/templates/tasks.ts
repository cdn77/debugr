export class TaskRenderer {
  private readonly taskStack: number[] = [];

  public renderTaskStart(id: number, parent?: number): string | undefined {
    if (parent === undefined) {
      this.taskStack.push(id);
      return undefined;
    }

    const src = this.taskStack.indexOf(parent);
    const dst = this.taskStack.length;

    try {
      return this.renderTaskBoundary(id, src, dst - src);
    } finally {
      this.taskStack.push(id);
    }
  }

  public renderTaskStates(active?: number): string {
    const idx = active !== undefined ? this.taskStack.indexOf(active) : undefined;

    return `<div class="entry-tasks">
            <svg>
              ${this.renderTaskLines()}
              ${idx !== undefined ? `<circle cx="${10 + idx * 15}" cy="21" r="4" />` : ''}
            </svg>
          </div>`;
  }

  public renderTaskEnd(id: number, parent?: number): string | undefined {
    if (parent === undefined) {
      this.taskStack.splice(0, this.taskStack.length);
      return undefined;
    }

    const src = this.taskStack.indexOf(id);
    const dst = this.taskStack.indexOf(parent);

    this.taskStack[src] = -1;

    for (let i = this.taskStack.length - 1; i >= 0 && this.taskStack[i] < 0; --i) {
      this.taskStack.pop();
    }

    return this.renderTaskBoundary(id, src, dst - src);
  }

  private renderTaskLines(): string {
    return this.taskStack
      .map((id, i) => (id < 0 ? '' : `<path d="M ${10 + i * 15} 0 v 10000" class="task-${id}" />`))
      .join('\n              ');
  }

  private renderTaskBoundary(task: number, start: number, offset: number): string {
    const x0 = 10 + start * 15;
    const dx = offset * 15;

    return `<div class="entry-tasks">
            <svg>
              ${this.renderTaskLines()}
              <path d="M ${x0} 0 v 10 c 0 20 ${dx} 20 ${dx} 40 v 10000" />
              <text x="${x0 + Math.max(0, dx)}" y="32.5">${task}</text>
            </svg>
          </div>`;
  }
}
