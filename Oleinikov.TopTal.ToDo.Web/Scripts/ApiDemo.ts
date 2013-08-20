/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />

interface ControllerInfo {
	Name: string;
	Actions: ActionInfo[];
}

interface ActionInfo {
	Name: string;
	Method: string;
	Path: string;
}

class ViewModel {
	public Apis = [
		{
			Name: 'Account',
			Actions: [
				{ Name: 'Create', Method: 'POST', Path: 'api/account' },
				{ Name: 'Info', Method: 'GET', Path: 'api/account' }
			]
		},
		{
			Name: 'Items',
			Actions: [
				{ Name: 'List', Method: 'GET', Path: 'api/items' },
				{ Name: 'Create', Method: 'POST', Path: 'api/items' },
				{ Name: 'Update', Method: 'PUT', Path: 'api/items' }
			]
		},
		{
			Name: 'Login',
			Actions: [
				{ Name: 'by username/password', Method: 'POST', Path: 'api/login' }
			]
		}
	];

	public Controller = ko.observable(<ControllerInfo>null);
	public Action = ko.observable(<ActionInfo>null);
	public InputData = ko.observable('');
	public OutputData = ko.observable('');
	public Status = ko.observable('Ready');
	public IsExecuting = ko.observable(false);
	public UrlPostfix = ko.observable("");

	public RequestUrl: KnockoutObservable<string>;
	public RequestText: KnockoutObservable<string>;

	constructor() {
		this.RequestUrl = ko.computed(() => {
			var a = this.Action();
			if (!a) return null;
			return "http://localhost:21610/" + a.Path + this.UrlPostfix();
		});
		this.RequestText = ko.computed(() => {
			var a = this.Action();
			if (!a) return null;
			return a.Method + " " + this.RequestUrl();
		});
	}

	public Execute() {
		this.IsExecuting(true);
		this.Status('Executing...');
		$.ajax(
			{
				url: this.RequestUrl(),
				method: this.Action().Method,
				accepts: 'application/json',
				contentType: 'application/json',
				data: this.Action().Method == "GET" ? null : this.InputData(),
				complete: (jqXHR: JQueryXHR, textStatus: string) => {
					this.Status(textStatus + ", " + jqXHR.status + " " + jqXHR.statusText);
					this.OutputData(jqXHR.responseText);
					this.IsExecuting(false);
				}
			});
	}
}

declare var _ViewModel: ViewModel;

function Init() {
	_ViewModel = new ViewModel();
	$(() => ko.applyBindings(_ViewModel));
}