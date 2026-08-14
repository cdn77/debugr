import colors from 'ansi-colors';
import type { ConsoleColor, ConsoleStyle } from './types';

const noColor: ConsoleColor = (value) => value;

export const ansi: ConsoleStyle = {
  blue: colors.blue,
  dim: colors.dim,
  magenta: colors.magenta,
  none: noColor,
  red: colors.red,
  yellow: colors.yellow,
  unstyle: colors.unstyle,
};

export const none: ConsoleStyle = {
  blue: noColor,
  dim: noColor,
  magenta: noColor,
  none: noColor,
  red: noColor,
  yellow: noColor,
  unstyle: noColor,
};
