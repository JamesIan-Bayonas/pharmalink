using PharmaLink.API.DTOs.Sales;

namespace PharmaLink.API.Interfaces
{
    public interface ISaleService
    {
        Task<int> ProcessSaleAsync(int userId, CreateSaleRequestDto request);
    }
}
