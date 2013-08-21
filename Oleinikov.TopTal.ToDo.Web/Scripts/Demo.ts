/// <reference path="typings/linq/linq.3.0.3-Beta4.d.ts" />
/// <reference path="Api-jquery.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />

module ToDo.Demo {
	export class ViewModel {
		public user = {
			token: ko.observable(<string>null),
			name: ko.observable(<string>null),
			password: ko.observable(<string>null),
			createdOn: ko.observable(<Date>null),
			updatedOn: ko.observable(<Date>null),

			confirmPassword: ko.observable(<string>null),

			canSavePassword: ko.observable(false),
			passwordWorngLength: ko.observable(false),
			passwordNotMatch: ko.observable(false)
		};

		public list = {
			orderBy: ko.observable("priority"),
			orderOptions: ["priority", "due date", "title", "creation time", "update time", "state"],
			orderDir: ko.observable("desc"),
			filter: ko.observable("active"),
			filterOptions: ["active", "completed", "all"],
			allItems: ko.observableArray<ItemViewModel>([]),
			items: ko.observable<ItemViewModel[]>([])
		};

		public view = {
			logged: ko.observable(false),
			login: ko.observable(false),
			list: ko.observable(false),
			listWithSelected: ko.observable(false),
			editItem: ko.observable(false),
			editProfile: ko.observable(false)
		};

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
					.from(this.list.allItems())
					.where((item: ItemViewModel) => this.list.filter() == "active"
						? item.state() == "New" || item.state() == "InProgress"
						: this.list.filter() == "completed"
						? item.state() == "Completed"
						: true);

				return (this.list.orderDir() == 'desc' ? result.orderByDescending(orderSelector) : result.orderBy(orderSelector)).toArray();
			});

			this.view.logged = ko.computed(() => !!this.user.token());
			this.view.login = ko.computed(() => !this.view.logged() && !this.isTryingAutoLogin());
			this.view.editItem = ko.computed(() => !this.view.editProfile() && !!this.editItem());
			this.view.list = ko.computed(() => !this.view.login() && !this.view.editProfile() && !this.view.editItem());
			this.view.listWithSelected = ko.computed(() => this.view.list() && !!this.selectedItem());

			this.user.passwordWorngLength = ko.computed(() => this.user.password() && this.user.password().length < 6);
			this.user.passwordNotMatch = ko.computed(() => this.user.password() && !this.user.passwordWorngLength() &&
				this.user.confirmPassword() && this.user.password() != this.user.confirmPassword());
			this.user.canSavePassword = ko.computed(() => this.user.password() && this.user.confirmPassword() &&
				!this.user.passwordWorngLength() && !this.user.passwordNotMatch());
		}

		public Login() {
			this.LoginOrRegister(Api.Account.Login);
		}

		public Register() {
			this.LoginOrRegister(Api.Account.Register);
		}

		private LoginOrRegister(func: (data: Api.Account.CreateUserModel) => Api.ICallInfo<Api.Account.AuthUserModel>) {
			return this.processLogin(func({
				Name: this.user.name(),
				Password: this.user.password()
			}).execute(this.ajax));
		}

		private processLogin(promise: Api.IPromise<Api.Account.AuthUserModel>, showErrors: boolean = true) {
			var p = promise.then(data => {
				this.loadUserData(data.User);
				this.user.token(data.AuthToken);
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
			this.user.name(null);
			this.user.password(null);
			this.user.token(null);
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
			Api.Items.List(this.user.token())
				.execute(this.ajax)
				.then(data => {
					this.list.allItems.destroyAll();
					for (var i in data)
						this.list.allItems.push(new ItemViewModel(this, data[i]));
				})
				.fail(ViewModel.catchApiError(err => window.alert(err.Message)));
		}

		public selectItem(item: ItemViewModel) {
			this.selectedItem(this.selectedItem() == item ? null : item);
		}

		public create() {
			new ItemViewModel(this, { State: "New", Title: "", Priority: "None" }, true).edit();
		}

		public editProfile() {
			if (this.view.editProfile())
				return;

			this.user.password("");
			this.user.confirmPassword("");
			this.view.editProfile(true);
		}

		public cancelEditProfile() {
			this.user.password("");
			this.user.confirmPassword("");
			this.view.editProfile(false);
		}

		private loadUserData(data: Api.Account.UserInfoModel) {
			this.user.name(data.Name);
			this.user.createdOn(new Date(data.CreatedOn));
			this.user.updatedOn(new Date(data.UpdatedOn));
		}

		public saveProfile() {
			var d = { Name: this.user.name(), Password: this.user.password() };
			this.cancelEditProfile();
			Api.Account.Update(this.user.token(), d)
				.execute(this.ajax)
				.then(data => this.loadUserData(data))
				.fail(ViewModel.catchApiError(err => window.alert(err.Message)));
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

		public remove() {
			if (this.model.selectedItem() == this)
				this.model.selectedItem(null);
			this.model.list.allItems.remove(this);
			if (this.item.Id && !this.isSaving()) {
				this.isSaving(true);
				Api.Items.Delete(this.model.user.token(), this.item.Id)
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
				this.model.list.allItems.push(this);
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
			(this.item.Id ? Api.Items.Update(this.model.user.token(), this.item.Id, this.item)
				: Api.Items.Create(this.model.user.token(), this.item))
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