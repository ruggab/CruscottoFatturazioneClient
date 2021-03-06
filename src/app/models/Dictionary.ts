interface IDictionary<T> {
    add(key: string, value: T): void;
    remove(key: string): void;
    containsKey(key: string): boolean;
    keys(): string[];
    values(): T[];
  }

  export class Dictionary<T> implements IDictionary<T> {

    private _keys: string[] = [];
    private _values: T[] = [];

    constructor(init?: { key: string; value: T; }[]) {
      if (init) {
        for (var x = 0; x < init.length; x++) {
          this[init[x].key] = init[x].value;
          this._keys.push(init[x].key);
          this._values.push(init[x].value);
        }
      }
    }

    add(key: string, value: T) {
      this[key] = value;
      this._keys.push(key);
      this._values.push(value);
    }

    remove(key: string) {
      var index = this._keys.indexOf(key, 0);
      this._keys.splice(index);
      this._values.splice(index);

      delete this[key];
    }

    keys(): string[] {
      return this._keys;
    }

    values(): T[] {
      return this._values;
    }

    containsKey(key: string) {
      if (typeof this[key] === "undefined") {
        return false;
      }
      return true;
    }

    toLookup(): IDictionary<T> {
      return this;
    }
  }