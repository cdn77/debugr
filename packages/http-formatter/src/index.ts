import { HttpFormatter } from './formatter';
import { RequestData, ResponseData } from './types';

export { HttpFormatter } from './formatter';
export * from './types';

export function httpFormatter(): HttpFormatter {
  return new HttpFormatter();
}

declare module '@debugr/core' {
  export interface Plugins {
    http: HttpFormatter;
  }

  export interface LoggerInterface {
    log(plugin: 'http', level: number, data: RequestData | ResponseData): void;
  }
}
