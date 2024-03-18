import type { PromiseInterface } from "@mmanos/swing-js/src/promise";

export interface AjaxOptions {
	url: string;
	type?: 'GET'|'POST'|'PUT'|'DELETE'|'OPTIONS';
	headers?: { [key: string]: any };
	data?: { [key: string]: any };
	raw?: any;
	files?: { [key: string]: any };
	json?: { [key: string]: any };
	onprogress?: Function;
	[key: string]: any;
};

export interface Ajax {
	(options: AjaxOptions): PromiseInterface;
	precheck(options: object): object;
	postcheck(options: object, d: PromiseInterface): void;
	_makeRequest(options: object): PromiseInterface;
};

export default ajax as Ajax;
