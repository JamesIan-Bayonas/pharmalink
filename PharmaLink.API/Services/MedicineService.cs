using PharmaLink.API.DTOs.Medicines;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;

namespace PharmaLink.API.Services
{
    public class MedicineService(IMedicineRepository medicineRepository) : IMedicineService
    {
        public async Task<IEnumerable<MedicineResponseDto>> GetAllMedicinesAsync()
        {
            // FIX: Create default parameters to satisfy the new Interface requirement
            // This gets the first 50 items by default for the Service layer
            var defaultParams = new MedicineParams
            {
                PageNumber = 1,
                PageSize = 50
            };

            // Use the Tuple destructuring feature
            var (medicines, totalCount) = await medicineRepository.GetAllAsync(defaultParams);

            // Logic: Map Entity to DTO here
            return medicines.Select(m => new MedicineResponseDto
            {
                Id = m.Id,
                Name = m.Name,
                CategoryId = m.CategoryId,
                StockQuantity = m.StockQuantity,
                Price = m.Price,
                ExpiryDate = m.ExpiryDate
            });
        }

        public async Task<MedicineResponseDto?> GetMedicineByIdAsync(int id)
        {
            var medicine = await medicineRepository.GetByIdAsync(id);
            if (medicine == null) return null;

            return new MedicineResponseDto
            {
                Id = medicine.Id,
                Name = medicine.Name,
                CategoryId = medicine.CategoryId,
                StockQuantity = medicine.StockQuantity,
                Price = medicine.Price,
                ExpiryDate = medicine.ExpiryDate
            };
        }

        public async Task<int> CreateMedicineAsync(CreateMedicineDto request)
        {
            // Business Logic: You could add validation here (e.g. "Price cannot be lower than cost")

            var newMedicine = new Medicine
            {
                Name = request.Name,
                CategoryId = request.CategoryId,
                StockQuantity = request.StockQuantity,  
                Price = request.Price,
                ExpiryDate = request.ExpiryDate
            };  

            return await medicineRepository.CreateAsync(newMedicine);
        }
    }
}