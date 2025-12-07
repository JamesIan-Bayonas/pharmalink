using PharmaLink.API.DTOs.Sales;

namespace PharmaLink.API.Interfaces.ServiceInterface
{
    public interface ISaleService
    {
        Task<int> ProcessSaleAsync(int userId, CreateSaleRequestDto request);

        Task<IEnumerable<object>> GetAllSalesAsync();
        Task<object?> GetSaleByIdAsync(int id);
    }
}
