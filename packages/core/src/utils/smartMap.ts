export class SmartMap<K, V> extends Map<K, V> {
  public filter<U extends V>(cb: (value: V, key: K, map: this) => value is U): SmartMap<K, U>;
  public filter(cb: (value: V, key: K, map: this) => unknown): SmartMap<K, V>;
  public filter(cb: (value: V, key: K, map: this) => unknown): SmartMap<K, V> {
    return new SmartMap([...this].filter(([k, v]) => cb(v, k, this)));
  }

  public map<V2>(cb: (value: V, key: K, map: this) => V2): SmartMap<K, V2> {
    return new SmartMap([...this].map(([k, v]) => [k, cb(v, k, this)]));
  }

  public reduce(cb: (previous: V, value: V, key: K, map: this) => V): V;
  public reduce(cb: (previous: V, value: V, key: K, map: this) => V, seed: V): V;
  public reduce<U>(cb: (previous: U, value: V, key: K, map: this) => U, seed: U): U;
  public reduce(cb: (previous: any, value: any, key: K, map: this) => any, seed?: any): any {
    const entries = this.entries();
    let value: any = seed;

    if (value === undefined) {
      if (!this.size) {
        throw new TypeError('Unable to reduce empty map');
      }

      const first = entries.next();
      [, value] = first.value;
    }

    for (const [k, v] of entries) {
      value = cb(value, v, k, this);
    }

    return value;
  }

  public reduceRight(cb: (previous: V, value: V, key: K, map: this) => V): V;
  public reduceRight(cb: (previous: V, value: V, key: K, map: this) => V, seed: V): V;
  public reduceRight<U>(cb: (previous: U, value: V, key: K, map: this) => U, seed: U): U;
  public reduceRight(cb: (previous: any, value: any, key: K, map: this) => any, seed?: any): any {
    return new SmartMap([...this].reverse()).reduce(cb, seed);
  }

  public reduceKeys(cb: (previous: K, key: K, map: this) => K): K;
  public reduceKeys(cb: (previous: K, key: K, map: this) => K, seed: K): K;
  public reduceKeys<U>(cb: (previous: U, key: K, map: this) => U, seed: U): U;
  public reduceKeys(cb: (previous: any, key: K, map: this) => any, seed?: any): any {
    const keys = this.keys();
    let key: any = seed;

    if (key === undefined) {
      if (!this.size) {
        throw new TypeError('Unable to reduce empty map');
      }

      const first = keys.next();
      key = first.value;
    }

    for (const k of keys) {
      key = cb(key, k, this);
    }

    return key;
  }

  public reduceKeysRight(cb: (previous: K, key: K, map: this) => K): K;
  public reduceKeysRight(cb: (previous: K, key: K, map: this) => K, seed: K): K;
  public reduceKeysRight<U>(cb: (previous: U, key: K, map: this) => U, seed: U): U;
  public reduceKeysRight(cb: (previous: any, key: K, map: this) => any, seed?: any): any {
    return new SmartMap([...this].reverse()).reduceKeys(cb, seed);
  }

  public find<U extends V>(cb: (value: V, key: K, map: this) => value is U): U | undefined;
  public find(cb: (value: V, key: K, map: this) => unknown): V | undefined;
  public find(cb: (value: V, key: K, map: this) => unknown): any {
    for (const [k, v] of this) {
      if (cb(v, k, this)) {
        return v;
      }
    }

    return undefined;
  }

  public findKey(cb: (value: V, key: K, map: this) => unknown): K | undefined {
    for (const [k, v] of this) {
      if (cb(v, k, this)) {
        return k;
      }
    }

    return undefined;
  }

  public includes(value: V): boolean {
    for (const v of this.values()) {
      if (v === value) {
        return true;
      }
    }

    return false;
  }
}
