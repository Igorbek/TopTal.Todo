module ToDo.Api {

	export interface Error {
		Message: string;
		ErrorCode?: string;
	}

	export interface ICallInfo<TOut> {
		url: string;
		method: string;
		data: any;
		params: { [name: string]: string; };
		execute(http: IHttpService): IPromise<TOut>;
	}

	export interface IHttpService {
		execute<TOut>(callInfo: ICallInfo<TOut>): IPromise<TOut>;
	}

	export interface IPromise<TOut> {
	}

	export var baseUrl = "http://localhost:21610/api/";

	export class callInfo<TOut> implements ICallInfo<TOut> {
		public params = {};
		constructor(public url: string, public method: string = "GET", public data: any = null) {
		}
		public withParam(name: string, value: string): callInfo<TOut> {
			this.params[name] = value;
			return this;
		}
		public withToken(token: string): callInfo<TOut> {
			return this.withParam("token", token);
		}
		public withId(id: string): callInfo<TOut> {
			this.url += "/" + id;
			return this;
		}
		public execute(http: IHttpService): IPromise<TOut> {
			return http.execute(this);
		}
	}

	export module Account {

		export var urlPrefix = "account";

		export interface CreateUserModel {
			Name: string;
			Password: string;
		}

		export interface UserInfoModel {
			Name: string;
			CreatedOn: string;
			UpdatedOn: string;
		}

		export interface AuthUserModel {
			User: UserInfoModel;
			AuthToken: string;
			AutoLoginToken?: string;
		}

		export function Register(data: CreateUserModel): ICallInfo<AuthUserModel> {
			return new callInfo(baseUrl + urlPrefix, "POST", data);
		}

		export function Info(auth: string): ICallInfo<UserInfoModel> {
			return new callInfo(baseUrl + urlPrefix, "GET").withToken(auth);
		}

		export function Login(data: Account.CreateUserModel): ICallInfo<Account.AuthUserModel> {
			return new callInfo(baseUrl + "login", "POST", data);
		}
	}

	export module Items {
		export var urlPrefix = "items";

		export interface ItemModel {
			Title: string;
			Description?: string;
			CompleteDue?: string;
			Priority?: string;
			State?: string;
		}

		export interface ItemInfoModel extends ItemModel {
			Id?: string;
			CreatedOn?: string;
			UpdatedOn?: string;
		}

		export function Create(auth: string, data: ItemModel): ICallInfo<ItemInfoModel> {
			return new callInfo(baseUrl + urlPrefix, "POST", data).withToken(auth);
		}

		export function Update(auth: string, id: string, data: ItemModel): ICallInfo<ItemInfoModel> {
			return new callInfo(baseUrl + urlPrefix, "PUT", data).withId(id).withToken(auth);
		}

		export function Delete(auth: string, id: string): ICallInfo<any> {
			return new callInfo(baseUrl + urlPrefix, "DELETE").withId(id).withToken(auth);
		}

		export function List(auth: string, from: number = null, count: number = null,
			orderBy: string = null, orderDesc: boolean = false): ICallInfo<ItemInfoModel[]> {
				var ci = new callInfo(baseUrl + urlPrefix, "GET");
				if (from) ci = ci.withParam("from", from.toString());
				if (count) ci = ci.withParam("count", count.toString());
				if (orderBy) ci = ci.withParam("orderBy", orderBy);
				if (orderDesc) ci = ci.withParam("orderDir", "desc");
				return ci.withToken(auth);
		}
	}
}