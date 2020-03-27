import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

export class QueueWriter {
  private readonly outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  async exists(id: string): Promise<boolean> {
    const dir = path.dirname(this.formatPath(0, id));
    const pattern = new RegExp(`^.+--${id}.htm`);

    try {
      for (const file of await readdir(dir, 'utf-8')) {
        if (pattern.test(file)) {
          return true;
        }
      }
    } catch (e) {
      /* noop */
    }

    return false;
  }

  async write(ts: number, id: string, contents: string): Promise<void> {
    const file = this.formatPath(ts, id);

    await mkdir(path.dirname(file), {
      mode: 0o755,
      recursive: true,
    });

    await writeFile(file, contents);
  }

  private formatPath(ts: number, id: string): string {
    const dt = new Date(ts)
      .toISOString()
      .replace(/\.\d+Z$/, '')
      .replace(/[:T]/g, '-');
    return path.join(this.outputDir, `${dt}--${id}.htm`);
  }
}
