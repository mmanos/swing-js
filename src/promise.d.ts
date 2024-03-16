export interface PromiseInterface {
	resolve(...args: any[]): this;
	reject(...args: any[]): this;
	then(resolve: Function, reject: Function): this;
	done(resolve: Function): this;
	fail(reject: Function): void;
	always(always: Function): this;
	info(always: Function): {state: string, data: any, callback: []};
	state(): string;
	data(): any;
}

export const promise: (fn_cb?: Function) => PromiseInterface;
export const when: (...promises: []) => PromiseInterface;
