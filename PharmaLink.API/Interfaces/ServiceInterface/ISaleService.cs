using PharmaLink.API.DTOs.Sales;

namespace PharmaLink.API.Interfaces.ServiceInterface
{
    public interface ISaleService
    {
        Task<int> ProcessSaleAsync(int userId, CreateSaleRequestDto request);
        Task<IEnumerable<object>> GetAllSalesAsync();
        Task<object?> GetSaleByIdAsync(int id);
        Task<bool> DeleteSaleAsync(int id);
        Task<bool> UpdateSaleAsync(int id, int userId, UpdateSaleDto request);
        Task<(IEnumerable<SaleResponseDto> Data, int TotalCount)> GetAllSalesPagedAsync(SalesParams parameters);
    }
}
