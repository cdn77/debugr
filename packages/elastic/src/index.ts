export * from './elasticHandler';
export * from './types';

import type { ElasticHandler } from './elasticHandler';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    elastic: ElasticHandler<TTaskContext, TGlobalContext>;
  }
}
