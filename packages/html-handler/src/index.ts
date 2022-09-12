export * from './fileWriter';
export * from './formatters';
export * from './htmlLogHandler';
export * from './htmlRenderer';
export { escapeHtml, renderCode, renderDetails } from './templates';
export * from './types';

import type { HtmlLogHandler } from './htmlLogHandler';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    html: HtmlLogHandler<TTaskContext, TGlobalContext>;
  }
}
