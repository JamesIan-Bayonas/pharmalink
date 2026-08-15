using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;

namespace PharmaLink.API.Services
{
    public class SaleService(ISaleRepository saleRepo, IMedicineRepository medicineRepo) : ISaleService
    {
        public async Task<int> ProcessSaleAsync(int userId, CreateSaleRequestDto request)
        {
            // FIX CS8602: Guard against null or empty cart payload before processing
            if (request.Items == null || !request.Items.Any())
            {
                throw new ArgumentException("Sale request must contain at least one item.");
            }

            decimal totalAmount = 0;
            var saleItemsEntities = new List<SaleItem>();

            foreach (var itemDto in request.Items)
            {
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

            var saleEntity = new Sale
            {
                UserId = userId,
                TotalAmount = totalAmount,
                TransDate = DateTime.Now
            };

            return await saleRepo.CreateSaleTransactionAsync(saleEntity, saleItemsEntities);
        }

        public async Task<object?> GetSaleByIdAsync(int id)
        {
            var sale = await saleRepo.GetByIdAsync(id);
            if (sale == null) return null;

            var items = await saleRepo.GetItemsBySaleIdAsync(id);

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

                // FIX CS8601: Null-coalesce MedicineName to provide fallback string for non-nullable DTO property
                response.Items.Add(new SaleItemResponseDto
                {
                    Id = item.Id,
                    MedicineId = item.MedicineId,
                    MedicineName = medicine?.Name ?? "Unknown Medicine",
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

                    // FIX CS8601: Null-coalesce MedicineName to satisfy non-nullable required DTO field
                    response.Items.Add(new SaleItemResponseDto
                    {
                        Id = item.Id,
                        MedicineId = item.MedicineId,
                        MedicineName = medicine?.Name ?? "Unknown Medicine",
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
            return await saleRepo.DeleteSaleTransactionAsync(id);
        }

        public async Task<bool> UpdateSaleAsync(int id, int userId, UpdateSaleDto request)
        {
            var existingSale = await saleRepo.GetByIdAsync(id);
            if (existingSale == null) return false;

            decimal totalAmount = 0;
            var newSaleItems = new List<SaleItem>();

            foreach (var itemDto in request.Items)
            {
                var medicine = await medicineRepo.GetByIdAsync(itemDto.MedicineId);
                if (medicine == null)
                    throw new Exception($"Medicine ID {itemDto.MedicineId} not found.");

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

            var updatedSaleHeader = new Sale
            {
                UserId = userId,
                TotalAmount = totalAmount,
                TransDate = DateTime.Now
            };

            return await saleRepo.UpdateSaleTransactionAsync(id, updatedSaleHeader, newSaleItems);
        }

        public async Task<(IEnumerable<SaleResponseDto> Data, int TotalCount)> GetAllSalesPagedAsync(SalesParams parameters)
        {
            var (sales, totalCount) = await saleRepo.GetAllPagedAsync(parameters);

            var responseList = new List<SaleResponseDto>();

            foreach (var sale in sales)
            {
                var items = await saleRepo.GetItemsBySaleIdAsync(sale.Id);

                var saleDto = new SaleResponseDto
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

                    saleDto.Items.Add(new SaleItemResponseDto
                    {
                        Id = item.Id,
                        MedicineId = item.MedicineId,
                        MedicineName = medicine?.Name ?? "Deleted Medicine",
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice
                    });
                }
                responseList.Add(saleDto);
            }

            return (responseList, totalCount);
        }
    }
}