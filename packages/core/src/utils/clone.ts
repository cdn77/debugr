import { deserialize, serialize } from 'v8';

export function clone<T>(value: T): T {
  return deserialize(serialize(value));
}
