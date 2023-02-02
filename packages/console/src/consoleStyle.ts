import { blue, dim, magenta, red, unstyle, yellow } from 'ansi-colors';
import type { ConsoleColor, ConsoleStyle } from './types';

const noColor: ConsoleColor = (value) => value;

export const ansi: ConsoleStyle = {
  blue,
  dim,
  magenta,
  none: noColor,
  red,
  yellow,
  unstyle,
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
