export * from './fileWriter';
export * from './formatters';
export * from './htmlHandler';
export * from './htmlRenderer';
export { escapeHtml, renderCode, renderDetails } from './templates';
export * from './types';

import type { HtmlHandler } from './htmlHandler';

declare module '@debugr/core' {
  export interface Plugins<
    TTaskContext extends TContextBase = TContextBase,
    TGlobalContext extends TContextShape = TContextShape,
  > {
    html: HtmlHandler<TTaskContext, TGlobalContext>;
  }
}
