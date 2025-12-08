using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaLink.API.Entities;
using PharmaLink.API.DTOs.Medicines;
using PharmaLink.API.Interfaces.RepositoryInterface;
using Microsoft.Identity.Client;

namespace PharmaLink.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class MedicinesController : ControllerBase
    {
        private readonly IMedicineRepository _medicineRepository;

        public MedicinesController(IMedicineRepository medicineRepository)
        {
            _medicineRepository = medicineRepository;
        }

        [HttpPost]
        public async Task<IActionResult> CreateMedicine([FromBody] CreateMedicineDto request)
        {
            try
            {
                // Map DTO to Entity (The Manual Way)
                var newMedicine = new Medicine
                {
                    Name = request.Name,
                    CategoryId = request.CategoryId,
                    StockQuantity = request.StockQuantity,
                    Price = request.Price,
                    ExpiryDate = request.ExpiryDate
                };

                // Save to Database
                int newId = await _medicineRepository.CreateAsync(newMedicine);

                // Return 201 Created
                // We return the ID so the frontend knows what the new Item ID is.
                return Created("", new { id = newId, message = "Medicine added successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // GET: api/Medicines
        [HttpGet]
        public async Task<IActionResult> GetAllMedicines()
        {
            try
            {
                // Get raw data from DB
                var medicines = await _medicineRepository.GetAllAsync();

                // Map Entity -> DTO (Manual Mapping)
                // This converts the list of database rows into a clean JSON list
                var medicineDtos = medicines.Select(m => new MedicineResponseDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    CategoryId = m.CategoryId,
                    StockQuantity = m.StockQuantity,
                    Price = m.Price,
                    ExpiryDate = m.ExpiryDate
                });

                return Ok(medicineDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Medicines/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicineById(int id)
        {
            try
            {
                var medicine = await _medicineRepository.GetByIdAsync(id);

                if (medicine == null)
                    return NotFound(new { message = "Medicine not found" });

                // Map Entity -> DTO
                var medicineDto = new MedicineResponseDto
                {
                    Id = medicine.Id,
                    Name = medicine.Name,
                    CategoryId = medicine.CategoryId,
                    StockQuantity = medicine.StockQuantity,
                    Price = medicine.Price,
                    ExpiryDate = medicine.ExpiryDate
                };

                return Ok(medicineDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH: api/Medicines/5/stock
        [HttpPatch("{id}/stock")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateMedicineStockDto request)
        {
            try
            {
                bool success = await _medicineRepository.UpdateStockAsync(id, request.Quantity);

                if (!success)
                    return NotFound(new { message = "Medicine not found" });

                return Ok(new { message = "Stock updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/Medicines/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicine(int id, [FromBody] UpdateMedicineDto request)
        {
            try
            {
                // Check if it exists (Optional, but good practice)
                var existingMedicine = await _medicineRepository.GetByIdAsync(id);
                if (existingMedicine == null)
                    return NotFound(new { message = "Medicine not found" });

                // Map DTO -> Entity
                // We preserve the ID from the URL, but update everything else
                existingMedicine.Name = request.Name;
                existingMedicine.CategoryId = request.CategoryId;
                existingMedicine.StockQuantity = request.StockQuantity;
                existingMedicine.Price = request.Price;
                existingMedicine.ExpiryDate = request.ExpiryDate;

                // Save to DB
                bool success = await _medicineRepository.UpdateAsync(existingMedicine);

                if (!success)
                    return BadRequest(new { message = "Failed to update medicine" });

                return Ok(new { message = "Medicine updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // DELETE: api/Medicines/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            try
            {
                bool success = await _medicineRepository.DeleteAsync(id);
                if (!success)
                    return NotFound(new { message = "Medicine not found" });

                return Ok(new { message = "Medicine deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Cannot delete medicine: " + ex.Message });
            }
        }
    }
}