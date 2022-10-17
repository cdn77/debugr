import type {
  LogEntry,
  LogLevel,
  ReadonlyRecursive,
  TContextBase,
  TContextShape,
} from '@debugr/core';

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
  errorCallback?: (error: Error) => void;
  bodyMapper?: (
    entry: ReadonlyRecursive<LogEntry<TTaskContext, TGlobalContext>>,
  ) => Record<string, any>;
}
