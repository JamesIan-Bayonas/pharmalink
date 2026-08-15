using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace PharmaLink.API.Attributes
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class AdminGuardAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string _customMessage;
        public AdminGuardAttribute(string message)
        {
            _customMessage = message;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            // FIX CS8602: Safe null verification on user.Identity before checking authentication state
            if (user.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            if (!user.IsInRole("Admin"))
            {
                context.Result = new ObjectResult(new
                {
                    message = _customMessage,
                    error = "Forbidden Access"
                })
                {
                    StatusCode = 403
                };
            }
        }
    }
}