using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using PharmaLink.API.DTOs.Medicines;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Attributes;

namespace PharmaLink.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicinesController : ControllerBase
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMapper _mapper;
        public MedicinesController(IMedicineRepository medicineRepository, IMapper mapper)
        {
            _medicineRepository = medicineRepository;   
            _mapper = mapper;
        }

        [HttpPost]
        [AdminGuard("ACCESS DENIED: You strictly do not have the privilege to add inventory. Report to your Administrator.")]
        public async Task<IActionResult> CreateMedicine([FromBody] CreateMedicineDto request)
        {
            try
            {
                // 1. ROBUST VALIDATION: Check for duplicates using the normalized query
                var existingMedicine = await _medicineRepository.GetByNameAsync(request.Name);

                if (existingMedicine != null)
                {
                    // Return 409 Conflict with a helpful message
                    return Conflict(new { message = $"The medicine '{existingMedicine.Name}' already exists (ID: {existingMedicine.Id}). Please update the stock instead of creating a new entry." });
                }

                // 2. Proceed if unique
                var newMedicine = _mapper.Map<Medicine>(request);

                // Sanitize the name before saving (store it clean)
                newMedicine.Name = request.Name.Trim();

                int newId = await _medicineRepository.CreateAsync(newMedicine);

                return Created("", new { id = newId, message = "Medicine added successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Medicines
        // GET: api/Medicines?pageNumber=1&pageSize=10&searchTerm=bio
        [HttpGet]
        [Authorize(Roles = "Admin,Pharmacist")]
        // Add [FromQuery] to read parameters from the URL
        public async Task<IActionResult> GetAllMedicines([FromQuery] MedicineParams parameters)
        {
            try
            {
                // Pass parameters to the repository
                // The repo now returns a Tuple: (List of Items, Total Count)
                var (medicines, totalCount) = await _medicineRepository.GetAllAsync(parameters);

                var medicineDtos = _mapper.Map<IEnumerable<MedicineResponseDto>>(medicines);

                // Implement a smart response with Metadata
                var response = new
                {
                    Meta = new
                    {
                        TotalCount = totalCount,
                        PageSize = parameters.PageSize,
                        CurrentPage = parameters.PageNumber,
                        TotalPages = (int)Math.Ceiling(totalCount / (double)parameters.PageSize)
                    },
                    Data = medicineDtos
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Medicines/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> GetMedicineById(int id)
        {
            try
            {
                var medicine = await _medicineRepository.GetByIdAsync(id);

                if (medicine == null) return NotFound(new { message = "Medicine not found" });

                var medicineDto = _mapper.Map<MedicineResponseDto>(medicine);

                return Ok(medicineDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH: api/Medicines/5/stock
        [HttpPatch("{id}/stock")]
        [AdminGuard("ACCESS DENIED: Stock manipulation is strictly prohibited for your role.")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateMedicineStockDto request)
        {
            try
            {
                // Calls the repository method that runs:
                // "UPDATE Medicines SET StockQuantity = ... WHERE Id = ..."
                bool success = await _medicineRepository.UpdateStockAsync(id, request.Quantity);

                if (!success) return NotFound(new { message = "Medicine not found" });

                return Ok(new { message = "Stock count updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [AdminGuard("ACCESS DENIED: You are not authorized to modify medicine records.")]
        public async Task<IActionResult> UpdateMedicine(int id, [FromBody] UpdateMedicineDto request)
        {
            try
            {
                var existingMedicine = await _medicineRepository.GetByIdAsync(id);
                if (existingMedicine == null) return NotFound(new { message = "Medicine not found" });

                // Map ALL fields (Name, Price, Desc, etc.) because this is a PUT
                _mapper.Map(request, existingMedicine);

                bool success = await _medicineRepository.UpdateAsync(existingMedicine);

                if (!success) return BadRequest(new { message = "Failed to update medicine" });

                return Ok(new { message = "Medicine details updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Medicines/5
        [HttpDelete("{id}")]
        [AdminGuard("ACCESS DENIED: Deleting records is a violation of protocol. This action has been flagged.")]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            if (!User.IsInRole("Admin"))
            {
                return StatusCode(403, new { message = "ACCESS DENIED: Deleting records is a violation of protocol. This action has been flagged." });
            }
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