/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="ApiDescription.ts" />

module ToDo.Api.Doc {
	class ViewModel {
		public api = Description.Description;

		constructor () {
		}
	}

	export function Init() {
		$(() => ko.applyBindings(new ViewModel()));
	}
}