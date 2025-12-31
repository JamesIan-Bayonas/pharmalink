using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces.RepositoryInterface
{
    public interface ISaleRepository
    {
        // The main transaction method used in the core flow
        Task<int> CreateSaleTransactionAsync(Sale sale, List<SaleItem> items);
        Task<Sale?> GetByIdAsync(int id);
        Task<(IEnumerable<Sale>, int)> GetAllPagedAsync(SalesParams parameters);
        Task<IEnumerable<Sale>> GetAllAsync();
        Task<IEnumerable<SaleItem>> GetItemsBySaleIdAsync(int saleId);
        Task<bool> DeleteSaleTransactionAsync(int saleId);
        Task<bool> UpdateSaleTransactionAsync(int saleId, Sale saleHeader, List<SaleItem> newItems);
    }       
}
