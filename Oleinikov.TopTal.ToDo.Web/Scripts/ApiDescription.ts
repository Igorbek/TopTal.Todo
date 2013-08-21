module ToDo.Api.Description {

	export interface Info {
		Modules: Module[];
		BaseUrl: string;
	}

	export interface Module {
		Name: string;
		Description?: string;
		Actions: Action[];
	}

	export interface Action {
		Name: string;
		Description?: string;
		UrlAppendParameters?: UrlAppendParameter[];
		UrlParameters?: Parameter[];
		RequireAuthToken?: boolean;
		Method?: HttpMethod;
		Url?: string;
		Data?: any;
		ReturnData?: any;
	}

	export interface Parameter {
		Name: string;
		Description?: string;
		Type?: Type;
		Required?: boolean;
	}

	export interface UrlAppendParameter extends Parameter {
		Prefix?: string;
		Suffix?: string;
	}

	export interface Type {
		Kind: TypeKind;
	}

	export enum TypeKind {
		String, Number, Date, Enum, Object, Array
	}

	export interface EnumType extends Type {
		Values: EnumValue[];
	}

	export interface ObjectType extends Type {
		Fields: Parameter[];
	}

	export interface ArrayType extends Type {
		ElementType: Type;
	}

	export interface EnumValue {
		Value: any;
		Name?: string;
		Description?: string;
	}

	export enum HttpMethod { GET, POST, PUT, DELETE }

	var tString: Type = { Kind: TypeKind.String };
	var tNumber: Type = { Kind: TypeKind.Number };

	var tUserData = {
		Kind: TypeKind.Object,
		Fields: [
			{
				Name: "Name",
				Description: "Name of the user",
				Type: tString
			},
			{
				Name: "CreatedOn",
				Description: "Date/Time in UTC in ISO format when user was created.",
				Type: tString
			},
			{
				Name: "UpdatedOn",
				Description: "Date/Time in UTC in ISO format when user was updated.",
				Type: tString
			}
		]
	};
	var tUserAuthData = {
		Kind: TypeKind.Object,
		Fields: [
			{
				Name: "AuthToken",
				Description: "Token to use with other requests to provide current authentication session.",
				Type: tString
			},
			{
				Name: "AutoLoginToken",
				Description: "Token to use with autologin. This token can be safety saved on client.",
				Type: tString
			},
			{
				Name: "User",
				Description: "Information of the user.",
				Type: tUserData
			}
		]
	};
	var tItemData = {
		Kind: TypeKind.Object,
		Fields: [
			{
				Name: "Title",
				Type: tString,
				Required: true
			},
			{
				Name: "Description",
				Type: tString
			},
			{
				Name: "CompleteDue",
				Type: tString
			},
			{
				Name: "Priority",
				Type: {Kind: TypeKind.Enum, Values: ["None", "Low", "Medium", "High"] }
			},
			{
				Name: "State",
				Type: { Kind: TypeKind.Enum, Values: ["New", "InProgress", "Completed"] }
			},
			{
				Name: "CreatedOn",
				Type: tString
			},
			{
				Name: "UpdatedOn",
				Type: tString
			}
		]
	};

	export var Description: Info = {
		BaseUrl: "/api/",
		Modules: [
			{
				Name: "Account",
				Description: "Actions with account",
				Actions: [
					{
						Name: "Register",
						Description: "Register new user",
						RequireAuthToken: false,
						Method: HttpMethod.POST,
						Url: "account",
						Data: {
							Kind: TypeKind.Object,
							Fields: [
								{
									Name: "Name",
									Description: "Name of the new user. Length must be from 1 to 60 character long and contains only letters.",
									Type: tString,
									Required: true
								},
								{
									Name: "Password",
									Description: "Password of the new user. Must be at least 6 character long.",
									Type: tString,
									Required: true
								}
							]
						},
						ReturnData: tUserAuthData
					},
					{
						Name: "Login",
						Description: "Login user with name and password.",
						RequireAuthToken: false,
						Method: HttpMethod.POST,
						Url: "login",
						Data: {
							Kind: TypeKind.Object,
							Fields: [
								{
									Name: "Name",
									Description: "Name of the user to login. Can be passed '_autologin'.",
									Type: tString,
									Required: true
								},
								{
									Name: "Password",
									Description: "Password of the user to login. Can be passed autologin token, if Name set to '_autologin'.",
									Type: tString,
									Required: true
								}
							]
						},
						ReturnData: tUserAuthData
					},
					{
						Name: "Get information",
						Description: "Return information on current user.",
						RequireAuthToken: true,
						Method: HttpMethod.GET,
						Url: "account",
						ReturnData: tUserData
					},
					{
						Name: "Update",
						Description: "Update user information",
						RequireAuthToken: true,
						Method: HttpMethod.PUT,
						Url: "account",
						Data: {
							Kind: TypeKind.Object,
							Fields: [
								{
									Name: "Name",
									Description: "Name of the user to update.",
									Type: tString,
									Required: true
								},
								{
									Name: "Password",
									Description: "New password of the user. Must be at least 6 character long.",
									Type: tString,
									Required: true
								}
							]
						},
						ReturnData: tUserData
					}
				]
			},
			{
				Name: "Items",
				Description: "Task items manipulations",
				Actions: [
					{
						Name: "List",
						Url: "items",
						RequireAuthToken: true,
						Method: HttpMethod.GET,
						UrlParameters: [
							{
								Name: "count",
								Description: "Number of items to return.",
								Type: tNumber
							},
							{
								Name: "from",
								Description: "Number of items to skip.",
								Type: tNumber
							},
							{
								Name: "orderBy",
								Description: "Parameter to order by.",
								Type: {
									Kind: TypeKind.Enum,
									Values: ["Priority", "CompleteDue", "CreatedOn", "UpdatedOn"]
								}
							},
							{
								Name: "orderDir",
								Description: "Direction of the ordering.",
								Type: { Kind: TypeKind.Enum, Values: ["asc", "desc"] }
							}
						],
						ReturnData: { Kind: TypeKind.Array, ElementType: tItemData }
					},
					{
						Name: "Create",
						Description: "Create new task item.",
						Url: "items",
						RequireAuthToken: true,
						Method: HttpMethod.POST,
						Data: tItemData,
						ReturnData: tItemData
					},
					{
						Name: "Update",
						Description: "Update existing task item.",
						Url: "items",
						RequireAuthToken: true,
						Method: HttpMethod.PUT,
						UrlAppendParameters: [
							{
								Prefix: "/",
								Name: "id",
								Description: "Identifier of the task item to update.",
								Type: tString,
								Required: true
							}
						],
						Data: tItemData,
						ReturnData: tItemData
					},
					{
						Name: "Delete",
						Description: "Delete existing task item.",
						Url: "items",
						RequireAuthToken: true,
						UrlAppendParameters: [
							{
								Prefix: "/",
								Name: "id",
								Description: "Identifier of the task item to delete.",
								Type: tString,
								Required: true
							}
						],
						Method: HttpMethod.DELETE
					}
				]
			}
		]
	};
}