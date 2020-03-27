import { SqlFormatter } from './formatter';
import { QueryData } from './types';

export { SqlFormatter } from './formatter';
export * from './types';

export function sqlFormatter(): SqlFormatter {
  return new SqlFormatter();
}

declare module '@debugr/core' {
  export interface Plugins {
    sql: SqlFormatter;
  }

  export interface Logger {
    log(plugin: 'sql', level: number, data: QueryData): void;
    log(plugin: 'sql', level: number, message: string, data: QueryData): void;
    log(plugin: 'sql', level: number, message: string, params: any[], data: QueryData): void;
  }
}
