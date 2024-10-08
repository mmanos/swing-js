export interface CustomDateInterface {}

export interface DateInterface extends CustomDateInterface {
	(date?: number|string|Date|DateInterface|null, utc?: boolean|string, format?: string): DateInterface;
	get(unit: string): number|null;
	set(unit: string, val: number|null): this;
	millisecond<T>(val?: T): T extends number ? this : number;
	milliseconds<T>(val?: T): T extends number ? this : number;
	second<T>(val?: T): T extends number ? this : number;
	seconds<T>(val?: T): T extends number ? this : number;
	minute<T>(val?: T): T extends number ? this : number;
	minutes<T>(val?: T): T extends number ? this : number;
	hour<T>(val?: T): T extends number ? this : number;
	hours<T>(val?: T): T extends number ? this : number;
	date<T>(val?: T): T extends number ? this : number;
	dates<T>(val?: T): T extends number ? this : number;
	day<T>(val?: T): T extends number ? this : number;
	days<T>(val?: T): T extends number ? this : number;
	week<T>(val?: T): T extends number ? this : number;
	weeks<T>(val?: T): T extends number ? this : number;
	month<T>(val?: T): T extends number ? this : number;
	months<T>(val?: T): T extends number ? this : number;
	year<T>(val?: T): T extends number ? this : number;
	years<T>(val?: T): T extends number ? this : number;
	timezone<T>(val?: T): T extends string ? this : string;
	add(amount: number, unit: string): this;
	subtract(amount: number, unit: string): this;
	startOf(unit: string): this;
	endOf(unit: string): this;
	diff(from: number|string|Date|DateInterface|null, unit?: string, precise?: boolean): number;
	isWeekday(): boolean;
	isWeekend(): boolean;
	isSame(d: number|string|Date|DateInterface|null, unit: string): boolean;
	between(start: number|string|Date|DateInterface|null, end: number|string|Date|DateInterface|null): boolean;
	from(date: number|string|Date|DateInterface|null, verbose?: boolean, postfix?: string, prefix?: string): string;
	fromNow(verbose?: boolean, postfix?: string, prefix?: string): string;
	dayOfMonth(which: number|string, day: number|string): this;
	valueOf(): number;
	unix(): number;
	toISOString(): string;
	toString(): string;
	toJSON(): string;
	toDate(): Date;
	isDST(): boolean;
	isValid(): boolean;
	clone(): DateInterface;
	toUTC(): DateInterface;
	format(mask?: string): string;
	utc(d?: number|string|Date|DateInterface|null, format?: string): DateInterface;
	isInstance(d: any): boolean;
	isDate(d: any): boolean;
}

export default date as DateInterface;
