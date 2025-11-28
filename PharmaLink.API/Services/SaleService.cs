using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
//using PharmaLink.API.Repositories;

namespace PharmaLink.API.Services
{
    public class SaleService : ISaleService
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
                // 1. Validation checking for existing Stock
                var medicine = await _medicineRepository.GetByIdAsync(itemDto.MedicineId);
                if (medicine == null)
                    throw new Exception($"Medicine ID {itemDto.MedicineId} not found.");

                if (medicine.StackQuantity < itemDto.Quantity)
                    throw new Exception($"Insufficient stock for {medicine.Name}. Available: {medicine.StackQuantity}");

                // Calculate Costs
                totalAmount += medicine.Price * itemDto.Quantity;

             
                saleItemsEntities.Add(new SaleItem
                {
                    MedicinesId = itemDto.MedicineId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = medicine.Price
                });
            }

            // 4. Create Sale Header Entity
            var saleEntity = new Sale
            {
                UserId = userId,
                TotalAmount = totalAmount,
                TransDate = DateTime.Now
            };

            // 5. Execute Transaction
            return await _saleRepository.CreateSaleTransactionAsync(saleEntity, saleItemsEntities);
        }
    }
}
