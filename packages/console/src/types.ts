import type { ImmutableDate, LogLevel, MappedRecord } from '@debugr/core';
import type { ConsoleColor } from './maps';

export type ConsoleHandlerOptions = {
  threshold?: LogLevel;
  levelMap?: MappedRecord<LogLevel, string>;
  colorMap?: MappedRecord<LogLevel, ConsoleColor>;
  timestamp?: boolean | ((ts: ImmutableDate) => string);
};
