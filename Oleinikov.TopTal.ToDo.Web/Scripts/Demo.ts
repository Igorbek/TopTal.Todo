/// <reference path="typings/linq/linq.3.0.3-Beta4.d.ts" />
/// <reference path="Api-jquery.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />

module ToDo.Demo {
	export class ViewModel {
		public Token = ko.observable(<string>null);

		public User = {
			Name: ko.observable(<string>null),
			Password: ko.observable(<string>null)
		};

		public CurrentUser = {
			Name: ko.observable(<string>null),
			CreatedOn: ko.observable(<Date>null)
		};

		public list = {
			orderBy: ko.observable("priority"),
			orderOptions: ["priority", "due date", "title", "creation time", "update time", "state"],
			orderDir: ko.observable("desc"),
			filter: ko.observable("active"),
			filterOptions: ["active", "completed", "all"],
			items: ko.observable<ItemViewModel[]>([])
		};

		public items = ko.observableArray<ItemViewModel>([]);
		public selectedItem = ko.observable<ItemViewModel>(null);
		public editItem = ko.observable<ItemViewModel>(null);

		public ajax = new Api.jQueryHttpService();

		public static catchApiError<T>(callback: (err: Api.Error) => void): (xhr: any) => void {
			return xhr => callback(<Api.Error>xhr.responseJSON);
		}

		public priorities = ["Low", "Medium", "High"];
		public priorityValues = { None: 0, Low: 1, Medium: 2, High: 3 };
		public states = ["New", "InProgress", "Completed"];
		public stateValues = { New: 0, InProgress: 1, Completed: 2 };

		constructor() {
			this.list.items = ko.computed(() => {
				var orderSelector = (item: ItemViewModel): any =>
					this.list.orderBy() == "priority" ? <any>this.priorityValues[item.priority()] :
					this.list.orderBy() == "due date" ? <any>item.completeDue() :
					this.list.orderBy() == "title" ? <any>item.title() :
					this.list.orderBy() == "creation time" ? item.createdOn() :
					this.list.orderBy() == "state" ? <any>this.stateValues[item.state()] :
					this.list.orderBy() == "update time" ? item.updatedOn() : null;

				var result = Enumerable
					.from(this.items())
					.where((item: ItemViewModel) => this.list.filter() == "active"
						? item.state() == "New" || item.state() == "InProgress"
						: this.list.filter() == "completed"
						? item.state() == "Completed"
						: true);

				return (this.list.orderDir() == 'desc' ? result.orderByDescending(orderSelector) : result.orderBy(orderSelector)).toArray();
			});
		}

		public Login() {
			this.LoginOrRegister(Api.Account.Login);
		}

		public Register() {
			this.LoginOrRegister(Api.Account.Register);
		}

		private LoginOrRegister(func: (data: Api.Account.CreateUserModel) => Api.ICallInfo<Api.Account.AuthUserModel>) {
			return this.processLogin(func({
				Name: this.User.Name(),
				Password: this.User.Password()
			}).execute(this.ajax));
		}

		private processLogin(promise: Api.IPromise<Api.Account.AuthUserModel>, showErrors: boolean = true) {
			var p = promise.then(data => {
				this.CurrentUser.Name(data.User.Name);
				this.CurrentUser.CreatedOn(new Date(data.User.CreatedOn));
				this.Token(data.AuthToken);
				this.LoadItems();
				if (data.AutoLoginToken)
					this.saveAutoLoginToken(data.AutoLoginToken);
			});
			return showErrors ? p.fail(ViewModel.catchApiError(err => window.alert(err.Message))) : p;
		}

		private saveAutoLoginToken(token: string) {
			if (window.localStorage)
				if (token)
					window.localStorage.setItem("autoLoginToken", token);
				else
					window.localStorage.removeItem("autoLoginToken");
			// store in cookie
		}

		private getAutoLoginToken(): string {
			return window.localStorage && window.localStorage.getItem("autoLoginToken");
		}

		public logout() {
			this.saveAutoLoginToken(null);
			this.User.Name(null);
			this.User.Password(null);
			this.Token(null);
		}

		public isTryingAutoLogin = ko.observable(false);
		public tryAutoLogin() {
			var token = this.getAutoLoginToken();
			if (!token) return;
			this.isTryingAutoLogin(true);
			this.processLogin(Api.Account.Login({ Name: "_autologin", Password: token }).execute(this.ajax), false)
				.always(() => this.isTryingAutoLogin(false))
				.fail(() => this.saveAutoLoginToken(null));
		}

		private LoadItems() {
			Api.Items.List(this.Token())
				.execute(this.ajax)
				.then(data => {
					this.items.destroyAll();
					for (var i in data)
						this.items.push(new ItemViewModel(this, data[i]));
				})
				.fail(ViewModel.catchApiError(err => window.alert(err.Message)));
		}

		public selectItem(item: ItemViewModel) {
			this.selectedItem(this.selectedItem() == item ? null : item);
		}

		public create() {
			new ItemViewModel(this, { State: "New", Title: "", Priority: "None" }, true).edit();
		}
	}

	export class ItemViewModel {
		public title = ko.observable("");
		public description = ko.observable("");
		public priority = ko.observable("");
		public completeDue = ko.observable(<Date>null);
		public createdOn = ko.observable(<Date>null);
		public updatedOn = ko.observable(<Date>null);
		public state = ko.observable("");
		public completeDueSet = ko.observable(false);

		constructor(public model: ViewModel, public item: Api.Items.ItemInfoModel, public isNew = false) {
			this.loadFromItem();
			this.completeDueSet = ko.computed({
				read: () => !!this.completeDue(),
				write: (value: boolean) => {
					if (value && !this.completeDue())
						this.completeDue(new Date());
					else if (!value && this.completeDue())
						this.completeDue(null);
				}
			});
		}

		private loadFromItem() {
			this.title(this.item.Title);
			this.description(this.item.Description);
			this.priority(this.item.Priority);
			this.completeDue(this.item.CompleteDue ? new Date(this.item.CompleteDue) : null);
			this.createdOn(this.item.CreatedOn ? new Date(this.item.CreatedOn) : null);
			this.updatedOn(this.item.UpdatedOn ? new Date(this.item.UpdatedOn) : null);
			this.state(this.item.State);
		}

		private saveToItem() {
			this.item.Title = this.title();
			this.item.Description = this.description();
			this.item.Priority = this.priority();
			this.item.CompleteDue = this.completeDue() ? this.completeDue().toISOString() : null;
			this.item.State = this.state();
		}

		//private tileColors = ["green", "pink", "teal", "yellow", "purple", "orange", "greenDark", "blueDark", "orangeDark"];

		public getCssClasses(index: number) {
			//var color = this.tileColors[index % this.tileColors.length];
			var css = { selected: this.model.selectedItem() == this };
			//css["bg-color-" + color] = true;

			var title = this.title() || "";
			var description = this.description() || "";

			if (title.length > 40 || description.length > 200)
				css["triple"] = true;
			else if (title.length > 20 || description.length > 100)
				css["double"] = true;

			return css;
		}

		public remove() {
			if (this.model.selectedItem() == this)
				this.model.selectedItem(null);
			this.model.items.remove(this);
			if (this.item.Id && !this.isSaving()) {
				this.isSaving(true);
				Api.Items.Delete(this.model.Token(), this.item.Id)
					.execute(this.model.ajax)
					.fail(ViewModel.catchApiError(err => window.alert(err.Message)))
					.always(() => this.isSaving(false));
			}
		}

		public edit() {
			this.saveToItem();
			this.model.editItem(this);
		}

		public complete() {
			if (this.isSaving()) return;
			this.state("Completed");
			this.checkSelected();
			this.save();
		}

		public uncomplete() {
			if (this.isSaving()) return;
			this.state("New");
			this.checkSelected();
			this.save();
		}

		public startProgress() {
			if (this.isSaving()) return;
			this.state("InProgress");
			this.checkSelected();
			this.save();
		}

		public stopProgress() {
			if (this.isSaving()) return;
			this.state("New");
			this.checkSelected();
			this.save();
		}

		private checkSelected() {
			if (this.model.selectedItem() == this && !Enumerable.from(this.model.list.items()).contains(this))
				this.model.selectedItem(null);
		}

		private done() {
			if (this.isNew) {
				this.isNew = false;
				this.model.items.push(this);
			}
			this.checkSelected();
			if (this.model.editItem() == this)
				this.model.editItem(null);
			this.save();
		}

		private cancel() {
			if (!this.isNew)
				this.loadFromItem();
			this.checkSelected();
			if (this.model.editItem() == this)
				this.model.editItem(null);
		}

		public isSaving = ko.observable(false);

		public save() {
			if (this.isSaving())
				return;
			this.isSaving(true);
			this.saveToItem();
			(this.item.Id ? Api.Items.Update(this.model.Token(), this.item.Id, this.item)
				: Api.Items.Create(this.model.Token(), this.item))
				.execute(this.model.ajax)
				.fail(ViewModel.catchApiError(err => window.alert(err.Message)))
				.then(data => {
					this.item = data;
					this.loadFromItem();
				})
				.always(() => this.isSaving(false));
		}
	}

	declare var _ViewModel: ViewModel;

	export function Init() {
		_ViewModel = new ViewModel();
		_ViewModel.tryAutoLogin();

		ko.bindingHandlers["datepicker"] = {
			init: (element: Element, valueAccessor: () => any) => {
				var value = valueAccessor();
				var $widget = <any>$(element);
				if ($widget.data("datepicker"))
					$widget.datepickerSetDate(ko.unwrap(value));
				else
					$widget.datepicker({ initDate: ko.unwrap(value) });

				if (ko.isObservable(value))
					$widget.on('date-selected', (el, dateString, dateMoment) => {
						value(dateMoment.toDate());
					});
			},
			update: (element: Element, valueAccessor: () => any) => {
				var $widget = <any>$(element);
				$widget.datepickerSetDate(ko.unwrap(valueAccessor()));
			}
		};

		$(() => ko.applyBindings(_ViewModel));
	}
}