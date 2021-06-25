import { TypeormLogger } from './typeorm';

export function typeormLogger(): TypeormLogger {
  return new TypeormLogger();
}

declare module '@debugr/core' {
  export interface Plugins {
    typeorm: TypeormLogger;
  }
}
