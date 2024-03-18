export const each: (obj: object, iterator: Function, context: any) => object;
export const inArray: (elem: any, arr: []) => boolean;
export const bind: (fn: Function, context: any) => Function;
export const ready: (f: Function) => void;
export const extend: <X, Y>(obj: X, ...args: Y[]) => X & Y;
export const isNumeric: (value: any) => boolean;
export const isArray: (value: any) => boolean;
export const inherits: (protoProps: object, staticProps?: object) => object;
