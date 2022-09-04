import type { LogLevel } from '@debugr/core';
import type { ConsoleColor } from './maps';

export type ConsoleLogHandlerOptions = {
  threshold?: LogLevel | number;
  levelMap?: Record<number, string>;
  colorMap?: Record<number, ConsoleColor>;
  writeTimestamp?: boolean;
};
