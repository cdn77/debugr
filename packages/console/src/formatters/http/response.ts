import type { TContextBase, TContextShape } from '@debugr/core';
import { EntryType } from '@debugr/core';
import type { HttpResponseLogEntry } from '@debugr/http-common';
import type { ConsoleStyle } from '../../types';
import { AbstractHttpConsoleFormatter } from './abstract';

export class HttpResponseConsoleFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> extends AbstractHttpConsoleFormatter<TTaskContext, TGlobalContext> {
  public readonly id = 'debugr-http-response-console-formatter';
  public readonly entryType = EntryType.HttpResponse;

  public formatEntry(
    { data, error }: HttpResponseLogEntry<TTaskContext, TGlobalContext>,
    style: ConsoleStyle,
  ): string {
    return this.formatParts(
      `HTTP ${data.status} ${data.message}`,
      this.formatCommonParts(style, data, error),
    );
  }
}
