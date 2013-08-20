/// <reference path="Api.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />

module ToDo.Api {
	export interface IPromise<TOut> extends JQueryPromise<TOut> {
	}

	export class jQueryHttpService implements IHttpService {
		execute<T>(callInfo: ICallInfo<T>): IPromise<T> {
			var url = callInfo.url;
			$.each(callInfo.params, (k, v) => { url += (url.indexOf('?') >= 0 ? '&' : '?') + k + '=' + v; });
			return $.ajax({
				url: url,
				accepts: 'application/json',
				contentType: 'application/json',
				type: callInfo.method,
				data: callInfo.data == null ? null : JSON.stringify(callInfo.data)
			}).then((data) => <T>data);
		}
	}
}