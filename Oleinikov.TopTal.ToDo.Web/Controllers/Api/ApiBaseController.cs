using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Oleinikov.TopTal.ToDo.Data;
using Oleinikov.TopTal.ToDo.Web.Models.Api;

namespace Oleinikov.TopTal.ToDo.Web.Controllers.Api
{
	public abstract class ApiBaseController : ApiController
	{
		private static readonly Dictionary<string, Guid> Tokens = new Dictionary<string, Guid>();

		protected User GetUser(DataContext context)
		{
			var token = Request.GetQueryNameValuePairs()
				.Where(p => string.Equals(p.Key, "token", StringComparison.InvariantCultureIgnoreCase))
				.Select(p => p.Value)
				.SingleOrDefault();

			if (token == null || !Tokens.ContainsKey(token))
				throw new HttpResponseException(HttpStatusCode.Unauthorized);

			return context.Users.Find(Tokens[token]);
		}

		protected void EnsureModelValid(object model)
		{
			if (ModelState.IsValid && model == null)
				ModelState.AddModelError("", "Have not input data.");
			EnsureModelValid();
		}

		protected void EnsureModelValid()
		{
			if (!ModelState.IsValid)
				throw new ModelApiException(ModelState);
		}

		protected string LoginUser(User user)
		{
			var token = Guid.NewGuid().ToString("N");
			Tokens.Add(token, user.Id);
			return token;
		}

		protected string GetAutoLoginToken(User user, byte[] clientSpecific)
		{
			var data = GetAutoLoginData(user.Id, DateTime.UtcNow, clientSpecific);
			return ConvertBytesToString(user.CalculateSecretDataHash(data).Concat(data));
		}

		protected string ConvertBytesToString(IEnumerable<byte> value)
		{
			return value.Aggregate(
				new StringBuilder(),
				(builder, b) => builder.Append(b.ToString("x2")),
				builder => builder.ToString());
		}

		protected byte[] GetAutoLoginData(Guid id, DateTime time, byte[] clientSpecific)
		{
			// data = id + time + clientSpecific
			var data = new byte[16 /* Id */ + 8 /* time */ + clientSpecific.Length];
			id.ToByteArray().CopyTo(data, 0);
			BitConverter.GetBytes(time.ToBinary()).CopyTo(data, 16 /* Id */);
			clientSpecific.CopyTo(data, 16 /* Id */+ 8 /* time */);

			return data;
		}

		protected bool TryParseAutoLoginToken(string token, out byte[] hash, out Guid id, out DateTime time, out byte[] clientSpecific, out byte[] data)
		{
			hash = null;
			id = default (Guid);
			time = default (DateTime);
			clientSpecific = null;
			data = null;

			if (token.Length < 2*(16 /* MD5 hash */ + 16 /* Id */+ 8 /* time */) || token.Length%2 != 0)
				return false;

			try
			{
				hash = ParseBytes(token).Take(16).ToArray();
				data = ParseBytes(token.Skip(16*2)).ToArray();
				id = new Guid(data.Take(16).ToArray());
				time = DateTime.FromBinary(BitConverter.ToInt64(data.Skip(16).Take(8).ToArray(), 0));
				clientSpecific = data.Skip(16 + 8).ToArray();

				return true;
			}
			catch (FormatException)
			{
				return false;
			}
		}

		private IEnumerable<byte> ParseBytes(IEnumerable<char> source)
		{
			using (var e = source.GetEnumerator())
			{
				while (e.MoveNext())
				{
					var ch = e.Current;
					byte b = 0;
					if (ch >= '0' && ch <= '9')
						b = (byte)(ch - '0');
					else if (ch >= 'a' && ch <= 'f')
						b = (byte) (ch - 'a' + 10);
					else if (ch >= 'A' && ch <= 'F')
						b = (byte) (ch - 'A' + 10);
					else
						throw new FormatException();

					if (!e.MoveNext())
						throw new FormatException();

					ch = e.Current;
					b <<= 4;
					if (ch >= '0' && ch <= '9')
						b |= (byte)(ch - '0');
					else if (ch >= 'a' && ch <= 'f')
						b |= (byte)(ch - 'a' + 10);
					else if (ch >= 'A' && ch <= 'F')
						b |= (byte)(ch - 'A' + 10);
					else
						throw new FormatException();

					yield return b;
				}
			}
		}

		/*public override Task<HttpResponseMessage> ExecuteAsync(HttpControllerContext controllerContext, CancellationToken cancellationToken)
		{
			try
			{
				return base.ExecuteAsync(controllerContext, cancellationToken);
			}
			catch (ApiException ex)
			{
				controllerContext.ControllerDescriptor.Configuration.
			}
		}*/
	}

	public class ApiExceptionFilter : IExceptionFilter
	{
		public async Task ExecuteExceptionFilterAsync(HttpActionExecutedContext actionExecutedContext, CancellationToken cancellationToken)
		{
			var ex = actionExecutedContext.Exception as ApiException;
			if (ex == null)
				return;

			//var errorModel = new ErrorModel {Message = ex.Message, Data = ex.ErrorData};
			var errorModel = new HttpError(ex.Message) {{"ErrorCode", ex.ErrorCode}};
			if (ex.ErrorData != null)
				errorModel.Add("ErrorData", ex.ErrorData);
			var response = actionExecutedContext.Request.CreateErrorResponse(ex.StatusCode, errorModel);

			actionExecutedContext.Response = response;
			//actionExecutedContext.Exception = null;
		}

		public bool AllowMultiple { get { return false; } }
	}
}
