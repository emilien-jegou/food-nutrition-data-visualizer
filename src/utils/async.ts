type MapFn<V, T> = (v: V) => Promise<T>;
export const asyncMap = async <V, T>(data: V[], fn: MapFn<V, T>): Promise<T[]> =>
  Promise.all(data.map(fn));
