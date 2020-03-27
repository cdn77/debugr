import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { EventDispatcher } from '../events';
import { LogEntryQueue } from './types';
import { With } from '../types';

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

export class Writer {
  private readonly eventDispatcher: EventDispatcher;

  private readonly outputDir: string;

  private readonly writeDuplicates: boolean;

  private knownIDs: string[];

  constructor(eventDispatcher: EventDispatcher, outputDir: string, writeDuplicates: boolean) {
    this.eventDispatcher = eventDispatcher;
    this.outputDir = outputDir;
    this.writeDuplicates = writeDuplicates;
    this.knownIDs = [];
    this.eventDispatcher.on('queue.flush', this.handleFlush.bind(this));

    if (!this.writeDuplicates) {
      this.scanKnownIDs();
    }
  }

  private handleFlush(queue: With<LogEntryQueue, 'id'>): void {
    if (!this.writeDuplicates && queue.write === undefined && this.knownIDs.includes(queue.id)) {
      queue.write = false;
    }
  }

  async write(ts: number, id: string, content: string): Promise<void> {
    this.knownIDs.push(id);

    const file = this.formatPath(ts, id);

    await mkdir(path.dirname(file), {
      mode: 0o755,
      recursive: true,
    });

    await writeFile(file, content);
  }

  private formatPath(ts: number, id: string): string {
    const idx = id.lastIndexOf('/');
    const dt = new Date(ts)
      .toISOString()
      .replace(/\.\d+Z$/, '')
      .replace(/[:T]/g, '-');

    if (idx > -1) {
      return path.join(this.outputDir, id.substring(0, idx), `${dt}--${id.substring(idx + 1)}.htm`);
    } else {
      return path.join(this.outputDir, `${dt}--${id}.htm`);
    }
  }

  private async scanKnownIDs(): Promise<void> {
    const queue = [this.outputDir];
    let dir: string | undefined;

    while ((dir = queue.shift())) {
      let files: fs.Dirent[];

      try {
        files = await readdir(dir, { withFileTypes: true });
      } catch (e) {
        continue;
      }

      for (const file of files) {
        if (file.isFile()) {
          const m = /^\d\d\d\d-\d\d-\d\d-\d\d-\d\d-\d\d--([a-z0-9-]+).htm$/i.exec(file.name);

          if (m && !this.knownIDs.includes(m[1])) {
            this.knownIDs.push(m[1]);
          }
        } else if (file.isDirectory()) {
          queue.push(path.join(dir, file.name));
        }
      }
    }
  }
}
