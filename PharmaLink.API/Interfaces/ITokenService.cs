using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;

namespace PharmaLink.API.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}