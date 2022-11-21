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
    const dolly = JSON.parse(JSON.stringify(data));
    snapshots.add(dolly);
    return dolly;
  },
  v8<T>(data: T): T {
    const dolly = deserialize(serialize(data));
    snapshots.add(dolly);
    return dolly;
  },
  isSnapshot(data: any): boolean {
    return snapshots.has(data);
  },
};
