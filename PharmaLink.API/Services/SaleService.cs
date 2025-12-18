using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;
//using PharmaLink.API.Repositories;

namespace PharmaLink.API.Services
{
    public class SaleService(ISaleRepository saleRepo, IMedicineRepository medicineRepo) :  ISaleService
    {
        public async Task<int> ProcessSaleAsync(int userId, CreateSaleRequestDto request)
        {
            decimal totalAmount = 0;
            var saleItemsEntities = new List<SaleItem>();

            foreach (var itemDto in request.Items)
            {
                // Validation checking for existing Stock
                var medicine = await medicineRepo.GetByIdAsync(itemDto.MedicineId);
                if (medicine != null)
                {
                    if (medicine.StockQuantity < itemDto.Quantity)
                        throw new Exception($"Insufficient stock for {medicine.Name}. Available: {medicine.StockQuantity}");

                    totalAmount += medicine.Price * itemDto.Quantity;


                    saleItemsEntities.Add(new SaleItem
                    {
                        MedicineId = itemDto.MedicineId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = medicine.Price
                    });
                }
                else
                    throw new Exception($"Medicine ID {itemDto.MedicineId} not found.");
            }

            // Create Sale Header Entity
            var saleEntity = new Sale
            {
                UserId = userId,
                TotalAmount = totalAmount,
                TransDate = DateTime.Now
            };

            // Execute Transaction
            return await saleRepo.CreateSaleTransactionAsync(saleEntity, saleItemsEntities);
        }
        public async Task<object?> GetSaleByIdAsync(int id)
        {
            // Fetch Header
            var sale = await saleRepo.GetByIdAsync(id);
            if (sale == null) return null;

            // Fetch Details (Calling the method you asked about!)
            var items = await saleRepo.GetItemsBySaleIdAsync(id);

            // Map to DTO
            var response = new SaleResponseDto
            {
                Id = sale.Id,
                UserId = sale.UserId,
                TotalAmount = sale.TotalAmount,
                TransactionDate = sale.TransDate,
                Items = new List<SaleItemResponseDto>()
            };

            // Map Items
            foreach (var item in items)
            {
                var medicine = await medicineRepo.GetByIdAsync(item.MedicineId);
                
                response.Items.Add(new SaleItemResponseDto
                {
                    Id = item.Id,
                    MedicineId = item.MedicineId,
                    MedicineName = medicine?.Name,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                });
            }

            return response;
        }

        public async Task<IEnumerable<object>> GetAllSalesAsync()
        {
            var sales = await saleRepo.GetAllAsync();
            var result = new List<object>();

            foreach (var sale in sales)
            {
                var items = await saleRepo.GetItemsBySaleIdAsync(sale.Id);
                
                var response = new SaleResponseDto
                {
                    Id = sale.Id,
                    UserId = sale.UserId,
                    TotalAmount = sale.TotalAmount,
                    TransactionDate = sale.TransDate,
                    Items = new List<SaleItemResponseDto>()
                };

                foreach (var item in items)
                {
                    var medicine = await medicineRepo.GetByIdAsync(item.MedicineId);
                    
                    response.Items.Add(new SaleItemResponseDto
                    {
                        Id = item.Id,
                        MedicineId = item.MedicineId,
                        MedicineName = medicine?.Name,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice
                    });
                }
                
                result.Add(response);
            }

            return result;
        }
        public async Task<bool> DeleteSaleAsync(int id)
        {
            // Simple pass-through to the repo logic
            return await saleRepo.DeleteSaleTransactionAsync(id);
        }

        public async Task<bool> UpdateSaleAsync(int id, int userId, UpdateSaleDto request)
        {
            // 1. Check if Sale exists
            var existingSale = await saleRepo.GetByIdAsync(id);
            if (existingSale == null) return false;

            decimal totalAmount = 0;
            var newSaleItems = new List<SaleItem>();

            // 2. Prepare New Items & Calculate Total (Logic reused from ProcessSale)
            foreach (var itemDto in request.Items)
            {
                var medicine = await medicineRepo.GetByIdAsync(itemDto.MedicineId);
                if (medicine == null)
                    throw new Exception($"Medicine ID {itemDto.MedicineId} not found.");

                // Note: Validating stock here is tricky because we haven't "Restored" the old stock yet.
                // ideally, we assume the Repo transaction handles the "Net" change, 
                // or we just check if (Stock + OldQty > NewQty). 
                // For simplicity in this project, we check absolute stock.
                if (medicine.StockQuantity < itemDto.Quantity)
                    throw new Exception($"Insufficient stock for {medicine.Name}.");

                totalAmount += medicine.Price * itemDto.Quantity;

                newSaleItems.Add(new SaleItem
                {
                    MedicineId = itemDto.MedicineId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = medicine.Price
                });
            }

            // 3. Prepare Header Update
            var updatedSaleHeader = new Sale
            {
                UserId = userId, // Update who modified it? Or keep original? Usually update to current user.
                TotalAmount = totalAmount,
                TransDate = DateTime.Now // Update timestamp
            };

            // 4. Call Repo
            return await saleRepo.UpdateSaleTransactionAsync(id, updatedSaleHeader, newSaleItems);
        }

    }
}
