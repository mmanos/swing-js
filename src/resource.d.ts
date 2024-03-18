import type { AjaxOptions } from "./ajax";
import type { PromiseInterface } from "./promise";

export interface ConstructableResource<T> {
	new(...args: any): T;
}

export interface ResourceOptions extends AjaxOptions {
	url?: string;
}

export interface ResourceSaveOptions extends ResourceOptions {
	extra_data?: object;
}

export interface Resource {
	$urlRoot: string;
	$set: (key: string|object, val?: any) => void;
	$url: () => string;
	$fetch: (options?: ResourceOptions) => PromiseInterface;
	$save: (options?: ResourceSaveOptions) => PromiseInterface;
	$destroy: (options?: ResourceOptions) => PromiseInterface;
	$restore: () => void;
	$load: (data: Resource|object) => void;
	$toJSON: () => object;
	$hasChanged: () => boolean;
	$changed: () => object;
	$replicate: () => Resource;
	$clone: () => Resource;
	query(options?: ResourceOptions): PromiseInterface;
	find(id: number|string, options?: ResourceOptions): PromiseInterface;
	paginate(page?: number, num?: number, options?: ResourceOptions): PromiseInterface;
	all(num?: number|object, options?: ResourceOptions): PromiseInterface;
	extend<T>(protoProps: T, staticProps?: T): T & Resource & ConstructableResource;
}

export default resource as Resource;
