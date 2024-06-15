export interface CustomCollectInterface {}

export interface CollectInterface extends CustomCollectInterface {
	(items?: Array<any>|{ [key: any]: any }, options?: { [key: any]: any }): CollectInterface;
	initialize(): void;
	isOrdered(): boolean;
	isKeyed(): boolean;
	add(items: Array<any>|{ [key: any]: any }): this;
	has(key:string|number|any): boolean;
	get(key:string|number|any, defaultValue?:any): any|null;
	put(key:string|number|any, value:any): this;
	pull(key:string|number|any): any;
	remove(key:string|number|any): this;
	indexOf(value:any): number;
	push(value:any): this;
	prepend(value:any): this;
	pop(): any;
	shift(): any;
	size(): number;
	isEmpty(): boolean;
	keys(): this;
	values(): this;
	all(): Array<any>|{ [key: any]: any };
	first(): any|null;
	last(): any|null;
	max(key?:string|number|any): any;
	min(key?:string|number|any): any;
	contains(key:string|number|Function|any, value?:any): boolean;
	filter(callback:Function, context?:any): this;
	reverse(): this;
	map(callback:Function, context?:any): this;
	pluck(key:string|number|any, keyName?:string|number|any): this;
	where(key:string|number|any, operator:string|any, value?:any): this;
	sort(compareFn?:Function): this;
	sortDesc(): this;
	sortBy(key:string|number|any): this;
	sortByDesc(key:string|number|any): this;
	sortKeys(compareFn?:Function): this;
	sortKeysDesc(): this;
	reset(): this;
	each(iterator:Function, context?:any): Array<any>|{ [key: any]: any };
	clone(): this;
	toJSON(): string;
}

export default collect as CollectInterface;
