var ToDo;
(function (ToDo) {
    (function (Api) {
        Api.baseUrl = "http://localhost:21610/api/";

        var callInfo = (function () {
            function callInfo(url, method, data) {
                if (typeof method === "undefined") { method = "GET"; }
                if (typeof data === "undefined") { data = null; }
                this.url = url;
                this.method = method;
                this.data = data;
                this.params = {};
            }
            callInfo.prototype.withParam = function (name, value) {
                this.params[name] = value;
                return this;
            };
            callInfo.prototype.withToken = function (token) {
                return this.withParam("token", token);
            };
            callInfo.prototype.withId = function (id) {
                this.url += "/" + id;
                return this;
            };
            callInfo.prototype.execute = function (http) {
                return http.execute(this);
            };
            return callInfo;
        })();
        Api.callInfo = callInfo;

        (function (Account) {
            Account.urlPrefix = "account";

            function Register(data) {
                return new Api.callInfo(Api.baseUrl + Account.urlPrefix, "POST", data);
            }
            Account.Register = Register;

            function Info(auth) {
                return new Api.callInfo(Api.baseUrl + Account.urlPrefix, "GET").withToken(auth);
            }
            Account.Info = Info;

            function Login(data) {
                return new Api.callInfo(Api.baseUrl + "login", "POST", data);
            }
            Account.Login = Login;
        })(Api.Account || (Api.Account = {}));
        var Account = Api.Account;

        (function (Items) {
            Items.urlPrefix = "items";

            function Create(auth, data) {
                return new Api.callInfo(Api.baseUrl + Items.urlPrefix, "POST", data).withToken(auth);
            }
            Items.Create = Create;

            function Update(auth, id, data) {
                return new Api.callInfo(Api.baseUrl + Items.urlPrefix, "PUT", data).withId(id).withToken(auth);
            }
            Items.Update = Update;

            function Delete(auth, id) {
                return new Api.callInfo(Api.baseUrl + Items.urlPrefix, "DELETE").withId(id).withToken(auth);
            }
            Items.Delete = Delete;

            function List(auth, from, count, orderBy, orderDesc) {
                if (typeof from === "undefined") { from = null; }
                if (typeof count === "undefined") { count = null; }
                if (typeof orderBy === "undefined") { orderBy = null; }
                if (typeof orderDesc === "undefined") { orderDesc = false; }
                var ci = new Api.callInfo(Api.baseUrl + Items.urlPrefix, "GET");
                if (from)
                    ci = ci.withParam("from", from.toString());
                if (count)
                    ci = ci.withParam("count", count.toString());
                if (orderBy)
                    ci = ci.withParam("orderBy", orderBy);
                if (orderDesc)
                    ci = ci.withParam("orderDir", "desc");
                return ci.withToken(auth);
            }
            Items.List = List;
        })(Api.Items || (Api.Items = {}));
        var Items = Api.Items;
    })(ToDo.Api || (ToDo.Api = {}));
    var Api = ToDo.Api;
})(ToDo || (ToDo = {}));
