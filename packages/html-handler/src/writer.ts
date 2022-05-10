import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { ImmutableDate } from '@debugr/core';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export class Writer {
  private readonly outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  async write(ts: ImmutableDate, id: string, content: string): Promise<string> {
    const file = this.formatPath(ts, id);

    await mkdir(path.dirname(file), {
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
      return path.join(this.outputDir, id.substring(0, idx), `${dt}--${id.substring(idx + 1)}.htm`);
    } else {
      return path.join(this.outputDir, `${dt}--${id}.htm`);
    }
  }
}
