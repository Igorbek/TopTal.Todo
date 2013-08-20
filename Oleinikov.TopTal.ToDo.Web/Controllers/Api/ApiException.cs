using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http.ModelBinding;

namespace Oleinikov.TopTal.ToDo.Web.Controllers.Api
{
    public class ApiException : Exception
    {
        public HttpStatusCode StatusCode { get; private set; }
		public string ErrorCode { get; private set; }
        public object ErrorData { get; private set; }

		public ApiException(string errorCode, string message, object data = null)
			: this(errorCode, message, HttpStatusCode.InternalServerError, data)
        {
		}

		public ApiException(string errorCode, string message, HttpStatusCode statusCode, object errorData = null)
			: base(message)
        {
			ErrorCode = errorCode;
            StatusCode = statusCode;
			ErrorData = errorData;
		}


    }

	public class ModelApiException : ApiException
	{
		public ModelApiException(ModelStateDictionary modelState) : base("Model", "Invalid request data", HttpStatusCode.BadRequest, GetErrorModel(modelState))
		{
		}

		private static IDictionary<string, IEnumerable<string>> GetErrorModel(ModelStateDictionary modelState)
		{
			return modelState.ToDictionary(ms => ms.Key, ms => ms.Value.Errors.Select(e => e.ErrorMessage));
		}
	}
}