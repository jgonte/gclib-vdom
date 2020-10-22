export type ParameterlessConstructor<T> = new () => T;

export type Constructor<T> = new (...args: Array<any>) => T;