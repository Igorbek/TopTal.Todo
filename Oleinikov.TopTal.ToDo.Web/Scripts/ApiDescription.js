var Todo;
(function (Todo) {
    (function (Api) {
        (function (Description) {
            (function (TypeKind) {
                TypeKind[TypeKind["String"] = 0] = "String";
                TypeKind[TypeKind["Number"] = 1] = "Number";
                TypeKind[TypeKind["Date"] = 2] = "Date";
                TypeKind[TypeKind["Enum"] = 3] = "Enum";
                TypeKind[TypeKind["Object"] = 4] = "Object";
            })(Description.TypeKind || (Description.TypeKind = {}));
            var TypeKind = Description.TypeKind;

            (function (HttpMethod) {
                HttpMethod[HttpMethod["GET"] = 0] = "GET";
                HttpMethod[HttpMethod["POST"] = 1] = "POST";
                HttpMethod[HttpMethod["PUT"] = 2] = "PUT";
                HttpMethod[HttpMethod["DELETE"] = 3] = "DELETE";
            })(Description.HttpMethod || (Description.HttpMethod = {}));
            var HttpMethod = Description.HttpMethod;

            Description.Description = {
                UrlPrefix: "http://localhost:21610/api/",
                Modules: [
                    {
                        Name: "Account",
                        UrlPrefix: "account",
                        Actions: [
                            {
                                Name: "Register",
                                Method: HttpMethod.POST,
                                Data: { Name: "string", Password: "string" },
                                RequireAuthToken: false
                            },
                            {
                                Name: "Info",
                                Method: HttpMethod.GET
                            }
                        ]
                    }
                ]
            };
        })(Api.Description || (Api.Description = {}));
        var Description = Api.Description;
    })(Todo.Api || (Todo.Api = {}));
    var Api = Todo.Api;
})(Todo || (Todo = {}));
