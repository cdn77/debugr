export * from './slackHandler';
export * from './types';

import type { TContextBase, TContextShape } from '@debugr/core';
import type { SlackHandler } from './slackHandler';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    slack: SlackHandler<TTaskContext, TGlobalContext>;
  }
}
