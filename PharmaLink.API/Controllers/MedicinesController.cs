using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using PharmaLink.API.DTOs.Medicines;

namespace PharmaLink.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Lock this down so strangers can't add drugs
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
                // 1. Map DTO to Entity (The Manual Way)
                var newMedicine = new Medicine
                {
                    Name = request.Name,
                    CategoryId = request.CategoryId,
                    StockQuantity = request.StockQuantity,
                    Price = request.Price,
                    ExpiryDate = request.ExpiryDate.Value
                };

                // 2. Save to Database
                int newId = await _medicineRepository.CreateAsync(newMedicine);

                // 3. Return 201 Created
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
                // 1. Get raw data from DB
                var medicines = await _medicineRepository.GetAllAsync();

                // 2. Map Entity -> DTO (Manual Mapping)
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

        // You likely already have [HttpGet] here...
    }
}