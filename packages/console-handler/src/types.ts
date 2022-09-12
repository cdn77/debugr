import type { ImmutableDate, LogLevel } from '@debugr/core';
import type { ConsoleColor } from './maps';

export type ConsoleLogHandlerOptions = {
  threshold?: LogLevel | number;
  levelMap?: Record<number, string>;
  colorMap?: Record<number, ConsoleColor>;
  timestamp?: boolean | ((ts: ImmutableDate) => string);
};
