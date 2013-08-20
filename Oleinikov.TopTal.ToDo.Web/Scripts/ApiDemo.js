/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var ViewModel = (function () {
    function ViewModel() {
        var _this = this;
        this.Apis = [
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
        this.Controller = ko.observable(null);
        this.Action = ko.observable(null);
        this.InputData = ko.observable('');
        this.OutputData = ko.observable('');
        this.Status = ko.observable('Ready');
        this.IsExecuting = ko.observable(false);
        this.UrlPostfix = ko.observable("");
        this.RequestUrl = ko.computed(function () {
            var a = _this.Action();
            if (!a)
                return null;
            return "http://localhost:21610/" + a.Path + _this.UrlPostfix();
        });
        this.RequestText = ko.computed(function () {
            var a = _this.Action();
            if (!a)
                return null;
            return a.Method + " " + _this.RequestUrl();
        });
    }
    ViewModel.prototype.Execute = function () {
        var _this = this;
        this.IsExecuting(true);
        this.Status('Executing...');
        $.ajax({
            url: this.RequestUrl(),
            method: this.Action().Method,
            accepts: 'application/json',
            contentType: 'application/json',
            data: this.Action().Method == "GET" ? null : this.InputData(),
            complete: function (jqXHR, textStatus) {
                _this.Status(textStatus + ", " + jqXHR.status + " " + jqXHR.statusText);
                _this.OutputData(jqXHR.responseText);
                _this.IsExecuting(false);
            }
        });
    };
    return ViewModel;
})();

function Init() {
    _ViewModel = new ViewModel();
    $(function () {
        return ko.applyBindings(_ViewModel);
    });
}
