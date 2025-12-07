using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces.ServiceInterface
{
    public interface ITokenService
    {
        string GenerateToken(User user);

    }
}