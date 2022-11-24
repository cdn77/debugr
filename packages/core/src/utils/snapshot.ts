import { deserialize, serialize } from 'v8';
import { CloningStrategy } from '../types';

const snapshots: WeakSet<any> = new WeakSet();

export const snapshot = {
  take<T>(data: T, strategy: CloningStrategy): T {
    switch (strategy) {
      case CloningStrategy.Json:
        return snapshot.json(data);
      case CloningStrategy.V8:
        return snapshot.v8(data);
    }
  },
  json<T>(data: T): T {
    try {
      const dolly = JSON.parse(JSON.stringify(data));
      snapshots.add(dolly);
      return dolly;
    } catch {
      return data;
    }
  },
  v8<T>(data: T): T {
    try {
      const dolly = deserialize(serialize(data));
      snapshots.add(dolly);
      return dolly;
    } catch {
      return data;
    }
  },
  isSnapshot(data: any): boolean {
    return snapshots.has(data);
  },
};
