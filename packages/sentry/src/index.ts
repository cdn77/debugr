export * from './sentryHandler';
export * from './types';

import type { SentryHandler } from './sentryHandler';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    sentry: SentryHandler<TTaskContext, TGlobalContext>;
  }
}
