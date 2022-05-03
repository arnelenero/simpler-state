// TODO: Replace this with `typeof useEntity` instead.
export type EntityHook<T> = {
  (): T
  <C>(transform?: (value: T) => C, equalityFn?: (a: any, b: any) => boolean): C
}
