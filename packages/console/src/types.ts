import type { ImmutableDate, LogLevel, MappedRecord } from '@debugr/core';

export type ConsoleColor = (value: string) => string;

export type ConsoleStyle = {
  blue: ConsoleColor;
  dim: ConsoleColor;
  magenta: ConsoleColor;
  none: ConsoleColor;
  red: ConsoleColor;
  yellow: ConsoleColor;
  unstyle: ConsoleColor;
};

export type ConsoleStyleName = Exclude<keyof ConsoleStyle, number | symbol>;

export type ConsoleHandlerOptions = {
  threshold?: LogLevel;
  levelMap?: MappedRecord<LogLevel, string>;
  colorMap?: MappedRecord<LogLevel, ConsoleColor | ConsoleStyleName>;
  colors?: boolean;
  timestamp?: boolean | ((ts: ImmutableDate) => string);
};
