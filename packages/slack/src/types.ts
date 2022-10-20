import type {
  LogEntry,
  LogLevel,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';

export type MessageFormatter<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> = (
  entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
) => Record<string, any> | undefined | null | false | 0 | '';

export interface SlackHandlerOptions<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
> {
  webhookUrl: string;
  threshold?: LogLevel;
  channel?: string;
  username?: string;
  iconUrl?: string;
  iconEmoji?: string;
  formatter?: MessageFormatter<TTaskContext, TGlobalContext>;
}
