import type { TContextBase, TContextShape } from '@debugr/core';
import type { HttpResponseLogEntry } from '@debugr/http-common';
import { AbstractHttpConsoleFormatter } from './abstract';

export class HttpResponseConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
  > extends AbstractHttpConsoleFormatter<TTaskContext, TGlobalContext> {
  readonly id: string = 'debugr-http-response-console-formatter';

  readonly entryType: string = 'http.response';

  formatEntry({ data, error }: HttpResponseLogEntry<TTaskContext, TGlobalContext>): string {
    return this.formatParts(
      `HTTP ${data.status} ${data.message}`,
      this.formatCommonParts(data, error),
    );
  }
}
