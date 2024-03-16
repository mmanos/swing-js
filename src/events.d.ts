
export const on: (el: HTMLElement|object, events: string, handler: Function, context: any) => void;
export const off: (el: HTMLElement|object, events: string, handler: Function) => void;
export const trigger: (el: HTMLElement|object, event: string, ...args: any[]) => void;
export const observable: (obj: object) => object;
