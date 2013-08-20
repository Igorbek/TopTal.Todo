using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Oleinikov.TopTal.ToDo.Data;
using Oleinikov.TopTal.ToDo.Web.Models.Api;

namespace Oleinikov.TopTal.ToDo.Web.Controllers.Api
{
    public class AccountController : ApiBaseController
    {
        public UserAuthModel Post(UserCreateModel value)
        {
			EnsureModelValid(value);

            using (var context = new DataContext())
            {
	            if (value.Name != null)
				{
					if (context.Users.Any(u => u.State > UserState.Ok && u.Name == value.Name))
			            throw new ApiException("User.Duplicate", "User with specified name is already exists.");
				}

	            var user = value.CreateUser();
                context.Users.Add(user);
                context.SaveChanges();
                return new UserAuthModel {AuthToken = LoginUser(user), User = new UserModel(user)};
            }
        }

	    public UserModel Get()
        {
            using (var context = new DataContext())
            {
                var user = GetUser(context);
                return new UserModel(user);
            }
        }

	    public UserModel Put(UserUpdateModel value)
	    {
			using (var context = new DataContext())
			{
				var user = GetUser(context);
				value.UpdateUser(user);
				context.SaveChanges();
				return new UserModel(user);
			}
	    }
    }
}
