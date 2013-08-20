using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using Oleinikov.TopTal.ToDo.Data;
using Oleinikov.TopTal.ToDo.Web.Models.Api;

namespace Oleinikov.TopTal.ToDo.Web.Controllers.Api
{
	internal static class Helpers
	{
		public static byte[] GetClientSpecificData(this HttpRequestMessage request)
		{
			const string httpContextName = "MS_HttpContext";
			if (request.Properties.ContainsKey(httpContextName))
			{
				var context = request.Properties[httpContextName] as System.Web.HttpContextWrapper;
				if (context != null)
					if (context.Request.UserHostAddress != null)
						return System.Text.Encoding.Default.GetBytes(context.Request.UserHostAddress);
					else if (context.Request.UserAgent != null)
						return System.Text.Encoding.Default.GetBytes(context.Request.UserAgent);
			}

			return null;
		}
	}

	public class LoginController : ApiBaseController
	{
		public UserAuthModel PostLoginByUsernameAndPassword(UserLoginModel value)
		{
			EnsureModelValid(value);

			using (var context = new DataContext())
			{
				User user;

				if (value.Name == "_autologin")
				{
					byte[] hash;
					Guid id;
					DateTime time;
					byte[] clientSpecific;
					byte[] data;

					if (!TryParseAutoLoginToken(value.Password, out hash, out id, out time, out clientSpecific, out data))
						throw new ApiException("User.InvalidToken", "Invalid autologin token.", HttpStatusCode.BadRequest);

					if (time.AddMonths(1) < DateTime.UtcNow)
						throw new ApiException("User.TokenExpired", "Autologin token expired.", HttpStatusCode.NotFound);

					if (!clientSpecific.SequenceEqual(Request.GetClientSpecificData()))
						throw new ApiException("User.InvalidToken", "Invalid autologin token.", HttpStatusCode.BadRequest);

					user = context.Users.Find(id);

					if (user == null || user.SecretData == null || user.State <= UserState.Ok ||
					    !user.CalculateSecretDataHash(data).SequenceEqual(hash))
						throw new ApiException("User.InvalidNameOrPassword", "Invalid user name or password.", HttpStatusCode.NotFound);
				}
				else
				{
					user = context.Users.FirstOrDefault(u => u.Name == value.Name && u.State > UserState.Ok);
					if (user == null || user.PasswordHash == null || !user.CalculatePasswordHash(value.Password).SequenceEqual(user.PasswordHash))
						throw new ApiException("User.InvalidNameOrPassword", "Invalid user name or password.", HttpStatusCode.NotFound);
				}

				return new UserAuthModel
				{
					AuthToken = LoginUser(user),
					User = new UserModel(user),
					AutoLoginToken = GetAutoLoginToken(user, Request.GetClientSpecificData())
				};
			}
		}
	}
}