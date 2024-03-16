export interface ConstructableResource<T> {
	new(...args: any): T;
}

export interface Resource {
	$urlRoot: string;
	extend<T>(protoProps: T, staticProps?: T): T & Resource & ConstructableResource;
	find(id: number|string): Resource;
};

export default resource as Resource;
