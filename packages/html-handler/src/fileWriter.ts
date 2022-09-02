import type { ImmutableDate } from '@debugr/core';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type { HtmlWriter } from './types';

export class HtmlFileWriter implements HtmlWriter {
  private readonly outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  async write(ts: ImmutableDate, id: string, content: string): Promise<string> {
    const file = this.formatPath(ts, id);

    await mkdir(dirname(file), {
      mode: '0750',
      recursive: true,
    });

    await writeFile(file, content);
    return `file://${file}`;
  }

  private formatPath(ts: ImmutableDate, id: string): string {
    const idx = id.lastIndexOf('/');
    const dt = ts
      .toISOString()
      .replace(/\.\d+Z$/, '')
      .replace(/[:T]/g, '-');

    if (idx > -1) {
      return join(this.outputDir, id.substring(0, idx), `${dt}--${id.substring(idx + 1)}.htm`);
    } else {
      return join(this.outputDir, `${dt}--${id}.htm`);
    }
  }
}
