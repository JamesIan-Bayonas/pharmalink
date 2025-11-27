using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(User user, string password); // Returns JWT or Success Msg
        Task<string>? LoginAsync(string username, string password); // Returns JWT Token
    }
}
