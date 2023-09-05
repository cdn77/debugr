import type { TransformCallback } from 'stream';
import { Transform } from 'stream';

export class LogStream extends Transform {
  public readonly capture: boolean;
  private _content: string | undefined = undefined;
  private _length: number = 0;

  public constructor(capture: boolean = false) {
    super();
    this.capture = capture;
  }

  public get content(): string | undefined {
    return this._content;
  }

  public get length(): number {
    return this._length;
  }

  public _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
    this.push(chunk);

    if (!this.capture) {
      this._length += Buffer.isBuffer(chunk) ? chunk.byteLength : chunk.length;
      return callback();
    }

    const content = Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : chunk;
    this._content ??= '';
    this._content += content;
    this._length += content.length;
    callback();
  }
}
