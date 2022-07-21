import { LogLevel } from '@debugr/core';
import { ConsoleColor } from './maps';

export type ConsoleLogHandlerOptions = {
  threshold?: LogLevel | number;
  levelMap?: Record<number, string>;
  colorMap?: Record<number, ConsoleColor>;
  writeTimestamp?: boolean;
};
