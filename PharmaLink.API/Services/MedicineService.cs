using AutoMapper;
using PharmaLink.API.DTOs.Medicines;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;

namespace PharmaLink.API.Services
{
    public class MedicineService(IMedicineRepository medicineRepository, IMapper mapper) : IMedicineService
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
            return mapper.Map<IEnumerable<MedicineResponseDto>>(medicines);
        }

        public async Task<MedicineResponseDto?> GetMedicineByIdAsync(int id)
        {
            var medicine = await medicineRepository.GetByIdAsync(id);
            if (medicine == null) return null;

            return mapper.Map<MedicineResponseDto>(medicine);
        }

        public async Task<int> CreateMedicineAsync(CreateMedicineDto request)
        {
            // Business Logic: You could add validation here (e.g. "Price cannot be lower than cost")

            var newMedicine = mapper.Map<Medicine>(request);

            return await medicineRepository.CreateAsync(newMedicine);
        }
    }
}