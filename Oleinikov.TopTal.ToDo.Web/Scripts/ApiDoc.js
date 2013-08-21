var ToDo;
(function (ToDo) {
    (function (Api) {
        /// <reference path="typings/jquery/jquery.d.ts" />
        /// <reference path="typings/knockout/knockout.d.ts" />
        /// <reference path="ApiDescription.ts" />
        (function (Doc) {
            var ViewModel = (function () {
                function ViewModel() {
                    this.api = Api.Description.Description;
                }
                return ViewModel;
            })();

            function Init() {
                $(function () {
                    return ko.applyBindings(new ViewModel());
                });
            }
            Doc.Init = Init;
        })(Api.Doc || (Api.Doc = {}));
        var Doc = Api.Doc;
    })(ToDo.Api || (ToDo.Api = {}));
    var Api = ToDo.Api;
})(ToDo || (ToDo = {}));
