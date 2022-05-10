import { TypeormLogger } from './typeorm';

export function typeormLogger(): TypeormLogger {
  return new TypeormLogger();
}

declare module '@debugr/core' {
  export interface Plugins<
    TContext extends TContextBase = { processId: string },
    TGlobalContext extends Record<string, any> = {},
  > {
    typeorm: TypeormLogger<Partial<TContext>, TGlobalContext>;
  }
}
