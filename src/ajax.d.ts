import type { PromiseInterface } from "@mmanos/swing-js/src/promise";

export interface Ajax {
	(options: object): PromiseInterface;
	precheck(options: object): object;
	postcheck(options: object, d: PromiseInterface): void;
	_makeRequest(options: object): PromiseInterface;
};

export default ajax as Ajax;
