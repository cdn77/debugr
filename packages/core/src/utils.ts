import { vsprintf } from 'printj';
import { PluginId } from './plugins';

export type LogArgs =
  | [string | number, any]
  | [string | number, any, any]
  | [string | number, any, any, any]
  | [string | number, any, any, any, any];

export function normalizeLogArgs([a, b, c, d, e]: LogArgs): [
  PluginId | undefined,
  number,
  string | undefined,
  Record<string, any> | undefined,
] {
  const [plugin, level, messageOrDataOrError, paramsOrData, maybeData] =
    typeof a === 'string' ? [a, b, c, d, e] : [undefined, a, b, c, d];

  if (messageOrDataOrError instanceof Error) {
    const message = `${messageOrDataOrError.name}: ${messageOrDataOrError.message}`;
    const data = typeof paramsOrData === 'object' ? paramsOrData : {};
    data.stack = messageOrDataOrError.stack;
    return [plugin, level, message, data];
  } else if (typeof messageOrDataOrError === 'string') {
    const message = Array.isArray(paramsOrData)
      ? vsprintf(messageOrDataOrError, paramsOrData)
      : messageOrDataOrError;
    const data = Array.isArray(paramsOrData) ? maybeData : paramsOrData;
    return [plugin, level, message, data];
  } else {
    return [plugin, level, undefined, messageOrDataOrError];
  }
}
