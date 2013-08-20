var ToDo;
(function (ToDo) {
    /// <reference path="Api.ts" />
    /// <reference path="typings/jquery/jquery.d.ts" />
    (function (Api) {
        var jQueryHttpService = (function () {
            function jQueryHttpService() {
            }
            jQueryHttpService.prototype.execute = function (callInfo) {
                var url = callInfo.url;
                $.each(callInfo.params, function (k, v) {
                    url += (url.indexOf('?') >= 0 ? '&' : '?') + k + '=' + v;
                });
                return $.ajax({
                    url: url,
                    accepts: 'application/json',
                    contentType: 'application/json',
                    type: callInfo.method,
                    data: callInfo.data == null ? null : JSON.stringify(callInfo.data)
                }).then(function (data) {
                    return data;
                });
            };
            return jQueryHttpService;
        })();
        Api.jQueryHttpService = jQueryHttpService;
    })(ToDo.Api || (ToDo.Api = {}));
    var Api = ToDo.Api;
})(ToDo || (ToDo = {}));
