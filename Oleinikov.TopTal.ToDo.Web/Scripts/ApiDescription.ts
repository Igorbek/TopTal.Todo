module Todo.Api.Description {

	export interface Info {
		Modules: Module[];
		UrlPrefix: string;
	}

	export interface Module {
		Name: string;
		Actions: Action[];
		UrlPrefix?: string;
	}

	export interface Action {
		Name: string;
		Description?: string;
		UrlParameters?: Parameter[];
		RequireAuthToken?: boolean;
		Method?: HttpMethod;
		Url?: string;
		Data?: any;
	}

	export interface Parameter {
		Name: string;
		Description?: string;
		Type?: Type;
	}

	export interface Type {
		Kind: TypeKind;
	}

	export enum TypeKind {
		String, Number, Date, Enum, Object
	}

	export interface EnumType extends Type {
		Values: EnumValue[];
	}

	export interface ObjectType extends Type {
		[name: string]: Type;
	}

	export interface EnumValue {
		Value: any;
		Name?: string;
		Description?: string;
	}

	export enum HttpMethod { GET, POST, PUT, DELETE }

	export var Description: Info = {
		UrlPrefix: "http://localhost:21610/api/",
		Modules: [
			{
				Name: "Account",
				UrlPrefix: "account",
				Actions: [
					{
						Name: "Register",
						Method: HttpMethod.POST,
						Data: { Name: "string", Password: "string" },
						RequireAuthToken: false
					},
					{
						Name: "Info",
						Method: HttpMethod.GET
					}
				]
			}
		]
	};
}