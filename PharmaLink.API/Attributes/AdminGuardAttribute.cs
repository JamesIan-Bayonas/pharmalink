using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace PharmaLink.API.Attributes
{
    // This attribute can be applied to Methods or Classes
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

            // Check if they are logged in at all
            if (!user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Check if they are an Admin
            if (!user.IsInRole("Admin"))
            {
                // If not, REJECT them immediately with your custom 403 message
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