var ToDo;
(function (ToDo) {
    /// <reference path="typings/linq/linq.3.0.3-Beta4.d.ts" />
    /// <reference path="Api-jquery.ts" />
    /// <reference path="typings/knockout/knockout.d.ts" />
    (function (Demo) {
        var ViewModel = (function () {
            function ViewModel() {
                var _this = this;
                this.user = {
                    token: ko.observable(null),
                    name: ko.observable(null),
                    password: ko.observable(null),
                    createdOn: ko.observable(null),
                    updatedOn: ko.observable(null),
                    confirmPassword: ko.observable(null),
                    canSavePassword: ko.observable(false),
                    passwordWorngLength: ko.observable(false),
                    passwordNotMatch: ko.observable(false)
                };
                this.list = {
                    orderBy: ko.observable("priority"),
                    orderOptions: ["priority", "due date", "title", "creation time", "update time", "state"],
                    orderDir: ko.observable("desc"),
                    filter: ko.observable("active"),
                    filterOptions: ["active", "completed", "all"],
                    allItems: ko.observableArray([]),
                    items: ko.observable([])
                };
                this.view = {
                    logged: ko.observable(false),
                    login: ko.observable(false),
                    list: ko.observable(false),
                    listWithSelected: ko.observable(false),
                    editItem: ko.observable(false),
                    editProfile: ko.observable(false)
                };
                this.selectedItem = ko.observable(null);
                this.editItem = ko.observable(null);
                this.ajax = new ToDo.Api.jQueryHttpService();
                this.priorities = ["Low", "Medium", "High"];
                this.priorityValues = { None: 0, Low: 1, Medium: 2, High: 3 };
                this.states = ["New", "InProgress", "Completed"];
                this.stateValues = { New: 0, InProgress: 1, Completed: 2 };
                this.isTryingAutoLogin = ko.observable(false);
                this.list.items = ko.computed(function () {
                    var orderSelector = function (item) {
                        return _this.list.orderBy() == "priority" ? _this.priorityValues[item.priority()] : _this.list.orderBy() == "due date" ? item.completeDue() : _this.list.orderBy() == "title" ? item.title() : _this.list.orderBy() == "creation time" ? item.createdOn() : _this.list.orderBy() == "state" ? _this.stateValues[item.state()] : _this.list.orderBy() == "update time" ? item.updatedOn() : null;
                    };

                    var result = Enumerable.from(_this.list.allItems()).where(function (item) {
                        return _this.list.filter() == "active" ? item.state() == "New" || item.state() == "InProgress" : _this.list.filter() == "completed" ? item.state() == "Completed" : true;
                    });

                    return (_this.list.orderDir() == 'desc' ? result.orderByDescending(orderSelector) : result.orderBy(orderSelector)).toArray();
                });

                this.view.logged = ko.computed(function () {
                    return !!_this.user.token();
                });
                this.view.login = ko.computed(function () {
                    return !_this.view.logged() && !_this.isTryingAutoLogin();
                });
                this.view.editItem = ko.computed(function () {
                    return !_this.view.editProfile() && !!_this.editItem();
                });
                this.view.list = ko.computed(function () {
                    return !_this.view.login() && !_this.view.editProfile() && !_this.view.editItem();
                });
                this.view.listWithSelected = ko.computed(function () {
                    return _this.view.list() && !!_this.selectedItem();
                });

                this.user.passwordWorngLength = ko.computed(function () {
                    return _this.user.password() && _this.user.password().length < 6;
                });
                this.user.passwordNotMatch = ko.computed(function () {
                    return _this.user.password() && !_this.user.passwordWorngLength() && _this.user.confirmPassword() && _this.user.password() != _this.user.confirmPassword();
                });
                this.user.canSavePassword = ko.computed(function () {
                    return _this.user.password() && _this.user.confirmPassword() && !_this.user.passwordWorngLength() && !_this.user.passwordNotMatch();
                });
            }
            ViewModel.catchApiError = function (callback) {
                return function (xhr) {
                    return callback(xhr.responseJSON);
                };
            };

            ViewModel.prototype.Login = function () {
                this.LoginOrRegister(ToDo.Api.Account.Login);
            };

            ViewModel.prototype.Register = function () {
                this.LoginOrRegister(ToDo.Api.Account.Register);
            };

            ViewModel.prototype.LoginOrRegister = function (func) {
                return this.processLogin(func({
                    Name: this.user.name(),
                    Password: this.user.password()
                }).execute(this.ajax));
            };

            ViewModel.prototype.processLogin = function (promise, showErrors) {
                if (typeof showErrors === "undefined") { showErrors = true; }
                var _this = this;
                var p = promise.then(function (data) {
                    _this.loadUserData(data.User);
                    _this.user.token(data.AuthToken);
                    _this.LoadItems();
                    if (data.AutoLoginToken)
                        _this.saveAutoLoginToken(data.AutoLoginToken);
                });
                return showErrors ? p.fail(ViewModel.catchApiError(function (err) {
                    return window.alert(err.Message);
                })) : p;
            };

            ViewModel.prototype.saveAutoLoginToken = function (token) {
                if (window.localStorage)
                    if (token)
                        window.localStorage.setItem("autoLoginToken", token);
else
                        window.localStorage.removeItem("autoLoginToken");
                // store in cookie
            };

            ViewModel.prototype.getAutoLoginToken = function () {
                return window.localStorage && window.localStorage.getItem("autoLoginToken");
            };

            ViewModel.prototype.logout = function () {
                this.saveAutoLoginToken(null);
                this.user.name(null);
                this.user.password(null);
                this.user.token(null);
            };

            ViewModel.prototype.tryAutoLogin = function () {
                var _this = this;
                var token = this.getAutoLoginToken();
                if (!token)
                    return;
                this.isTryingAutoLogin(true);
                this.processLogin(ToDo.Api.Account.Login({ Name: "_autologin", Password: token }).execute(this.ajax), false).always(function () {
                    return _this.isTryingAutoLogin(false);
                }).fail(function () {
                    return _this.saveAutoLoginToken(null);
                });
            };

            ViewModel.prototype.LoadItems = function () {
                var _this = this;
                ToDo.Api.Items.List(this.user.token()).execute(this.ajax).then(function (data) {
                    _this.list.allItems.destroyAll();
                    for (var i in data)
                        _this.list.allItems.push(new ItemViewModel(_this, data[i]));
                }).fail(ViewModel.catchApiError(function (err) {
                    return window.alert(err.Message);
                }));
            };

            ViewModel.prototype.selectItem = function (item) {
                this.selectedItem(this.selectedItem() == item ? null : item);
            };

            ViewModel.prototype.create = function () {
                new ItemViewModel(this, { State: "New", Title: "", Priority: "None" }, true).edit();
            };

            ViewModel.prototype.editProfile = function () {
                if (this.view.editProfile())
                    return;

                this.user.password("");
                this.user.confirmPassword("");
                this.view.editProfile(true);
            };

            ViewModel.prototype.cancelEditProfile = function () {
                this.user.password("");
                this.user.confirmPassword("");
                this.view.editProfile(false);
            };

            ViewModel.prototype.loadUserData = function (data) {
                this.user.name(data.Name);
                this.user.createdOn(new Date(data.CreatedOn));
                this.user.updatedOn(new Date(data.UpdatedOn));
            };

            ViewModel.prototype.saveProfile = function () {
                var _this = this;
                var d = { Name: this.user.name(), Password: this.user.password() };
                this.cancelEditProfile();
                ToDo.Api.Account.Update(this.user.token(), d).execute(this.ajax).then(function (data) {
                    return _this.loadUserData(data);
                }).fail(ViewModel.catchApiError(function (err) {
                    return window.alert(err.Message);
                }));
            };
            return ViewModel;
        })();
        Demo.ViewModel = ViewModel;

        var ItemViewModel = (function () {
            function ItemViewModel(model, item, isNew) {
                if (typeof isNew === "undefined") { isNew = false; }
                var _this = this;
                this.model = model;
                this.item = item;
                this.isNew = isNew;
                this.title = ko.observable("");
                this.description = ko.observable("");
                this.priority = ko.observable("");
                this.completeDue = ko.observable(null);
                this.createdOn = ko.observable(null);
                this.updatedOn = ko.observable(null);
                this.state = ko.observable("");
                this.completeDueSet = ko.observable(false);
                this.isSaving = ko.observable(false);
                this.loadFromItem();
                this.completeDueSet = ko.computed({
                    read: function () {
                        return !!_this.completeDue();
                    },
                    write: function (value) {
                        if (value && !_this.completeDue())
                            _this.completeDue(new Date());
else if (!value && _this.completeDue())
                            _this.completeDue(null);
                    }
                });
            }
            ItemViewModel.prototype.loadFromItem = function () {
                this.title(this.item.Title);
                this.description(this.item.Description);
                this.priority(this.item.Priority);
                this.completeDue(this.item.CompleteDue ? new Date(this.item.CompleteDue) : null);
                this.createdOn(this.item.CreatedOn ? new Date(this.item.CreatedOn) : null);
                this.updatedOn(this.item.UpdatedOn ? new Date(this.item.UpdatedOn) : null);
                this.state(this.item.State);
            };

            ItemViewModel.prototype.saveToItem = function () {
                this.item.Title = this.title();
                this.item.Description = this.description();
                this.item.Priority = this.priority();
                this.item.CompleteDue = this.completeDue() ? this.completeDue().toISOString() : null;
                this.item.State = this.state();
            };

            ItemViewModel.prototype.remove = function () {
                var _this = this;
                if (this.model.selectedItem() == this)
                    this.model.selectedItem(null);
                this.model.list.allItems.remove(this);
                if (this.item.Id && !this.isSaving()) {
                    this.isSaving(true);
                    ToDo.Api.Items.Delete(this.model.user.token(), this.item.Id).execute(this.model.ajax).fail(ViewModel.catchApiError(function (err) {
                        return window.alert(err.Message);
                    })).always(function () {
                        return _this.isSaving(false);
                    });
                }
            };

            ItemViewModel.prototype.edit = function () {
                this.saveToItem();
                this.model.editItem(this);
            };

            ItemViewModel.prototype.complete = function () {
                if (this.isSaving())
                    return;
                this.state("Completed");
                this.checkSelected();
                this.save();
            };

            ItemViewModel.prototype.uncomplete = function () {
                if (this.isSaving())
                    return;
                this.state("New");
                this.checkSelected();
                this.save();
            };

            ItemViewModel.prototype.startProgress = function () {
                if (this.isSaving())
                    return;
                this.state("InProgress");
                this.checkSelected();
                this.save();
            };

            ItemViewModel.prototype.stopProgress = function () {
                if (this.isSaving())
                    return;
                this.state("New");
                this.checkSelected();
                this.save();
            };

            ItemViewModel.prototype.checkSelected = function () {
                if (this.model.selectedItem() == this && !Enumerable.from(this.model.list.items()).contains(this))
                    this.model.selectedItem(null);
            };

            ItemViewModel.prototype.done = function () {
                if (this.isNew) {
                    this.isNew = false;
                    this.model.list.allItems.push(this);
                }
                this.checkSelected();
                if (this.model.editItem() == this)
                    this.model.editItem(null);
                this.save();
            };

            ItemViewModel.prototype.cancel = function () {
                if (!this.isNew)
                    this.loadFromItem();
                this.checkSelected();
                if (this.model.editItem() == this)
                    this.model.editItem(null);
            };

            ItemViewModel.prototype.save = function () {
                var _this = this;
                if (this.isSaving())
                    return;
                this.isSaving(true);
                this.saveToItem();
                (this.item.Id ? ToDo.Api.Items.Update(this.model.user.token(), this.item.Id, this.item) : ToDo.Api.Items.Create(this.model.user.token(), this.item)).execute(this.model.ajax).fail(ViewModel.catchApiError(function (err) {
                    return window.alert(err.Message);
                })).then(function (data) {
                    _this.item = data;
                    _this.loadFromItem();
                }).always(function () {
                    return _this.isSaving(false);
                });
            };
            return ItemViewModel;
        })();
        Demo.ItemViewModel = ItemViewModel;

        function Init() {
            _ViewModel = new ViewModel();
            _ViewModel.tryAutoLogin();

            ko.bindingHandlers["datepicker"] = {
                init: function (element, valueAccessor) {
                    var value = valueAccessor();
                    var $widget = $(element);
                    if ($widget.data("datepicker"))
                        $widget.datepickerSetDate(ko.unwrap(value));
else
                        $widget.datepicker({ initDate: ko.unwrap(value) });

                    if (ko.isObservable(value))
                        $widget.on('date-selected', function (el, dateString, dateMoment) {
                            value(dateMoment.toDate());
                        });
                },
                update: function (element, valueAccessor) {
                    var $widget = $(element);
                    $widget.datepickerSetDate(ko.unwrap(valueAccessor()));
                }
            };

            $(function () {
                return ko.applyBindings(_ViewModel);
            });
        }
        Demo.Init = Init;
    })(ToDo.Demo || (ToDo.Demo = {}));
    var Demo = ToDo.Demo;
})(ToDo || (ToDo = {}));
