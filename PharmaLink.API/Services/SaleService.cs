using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
//using PharmaLink.API.Repositories;

namespace PharmaLink.API.Services
{
    public class SaleService :  ISaleService
    {
        private readonly ISaleRepository _saleRepository;
        private readonly IMedicineRepository _medicineRepository; // Needed to check prices/stock

        public SaleService(ISaleRepository saleRepo, IMedicineRepository medicineRepo)
        {
            _saleRepository = saleRepo;     
            _medicineRepository = medicineRepo;
        }

        public async Task<int> ProcessSaleAsync(int userId, CreateSaleRequestDto request)
        {
            decimal totalAmount = 0;
            var saleItemsEntities = new List<SaleItem>();

            foreach (var itemDto in request.Items)
            {
                // Validation checking for existing Stock
                var medicine = await _medicineRepository.GetByIdAsync(itemDto.MedicineId);
                if (medicine == null)
                    throw new Exception($"Medicine ID {itemDto.MedicineId} not found.");

                if (medicine.StockQuantity < itemDto.Quantity)
                    throw new Exception($"Insufficient stock for {medicine.Name}. Available: {medicine.StockQuantity}");

                // Calculate Costs
                totalAmount += medicine.Price * itemDto.Quantity;

             
                saleItemsEntities.Add(new SaleItem
                {
                    MedicineId = itemDto.MedicineId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = medicine.Price
                });
            }

            // Create Sale Header Entity
            var saleEntity = new Sale
            {
                UserId = userId,
                TotalAmount = totalAmount,
                TransDate = DateTime.Now
            };

            // Execute Transaction
            return await _saleRepository.CreateSaleTransactionAsync(saleEntity, saleItemsEntities);
        }
        public async Task<object?> GetSaleByIdAsync(int id)
        {
            // Fetch Header
            var sale = await _saleRepository.GetByIdAsync(id);
            if (sale == null) return null;

            // Fetch Details (Calling the method you asked about!)
            var items = await _saleRepository.GetItemsBySaleIdAsync(id);

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
                var medicine = await _medicineRepository.GetByIdAsync(item.MedicineId);
                
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
            var sales = await _saleRepository.GetAllAsync();
            var result = new List<object>();

            foreach (var sale in sales)
            {
                var items = await _saleRepository.GetItemsBySaleIdAsync(sale.Id);
                
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
                    var medicine = await _medicineRepository.GetByIdAsync(item.MedicineId);
                    
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

    }
}
