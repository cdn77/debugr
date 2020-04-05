import { Request, Response } from 'express';

export function captureRequestBody(
  request: Request,
  cb: (err: any | null, body?: string) => void,
): void {
  let buffer: string = '';
  request.prependListener('data', chunk => (buffer += chunk.toString()));
  request.once('error', err => cb(err));
  request.once('end', () => cb(null, buffer));
}

export async function captureResponseBody(response: Response): Promise<string> {
  const write = response.write;
  const end = response.end;
  let buffer: string = '';

  response.write = (chunk: any, encoding?: any, cb?: any) => {
    buffer += chunk.toString();
    return write.call(response, chunk, encoding, cb);
  };

  response.end = (chunk: any, encoding?: any, cb?: any) => {
    if (chunk && typeof chunk !== 'function') {
      buffer += chunk.toString();
    }

    return end.call(response, chunk, encoding, cb);
  };

  return new Promise((resolve, reject) => {
    response.once('finish', () => resolve(buffer));
    response.once('error', reject);
  });
}
