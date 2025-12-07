using PharmaLink.API.DTOs.Medicines;

namespace PharmaLink.API.Interfaces.ServiceInterface
{
    public interface IMedicineService
    {
        Task<IEnumerable<MedicineResponseDto>> GetAllMedicinesAsync();
        Task<MedicineResponseDto?> GetMedicineByIdAsync(int id);
        Task<int> CreateMedicineAsync(CreateMedicineDto request);

    }
}