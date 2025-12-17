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
                var newMedicine = _mapper.Map<Medicine>(request);
                int newId = await _medicineRepository.CreateAsync(newMedicine);
                // Return 201 Created
                return Created("", new { id = newId, message = "Medicine added successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Medicines
        [HttpGet]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> GetAllMedicines()
        {
            try
            {
                var medicines = await _medicineRepository.GetAllAsync();

                // This converts the list of database rows into a clean JSON list
                var medicineDtos = _mapper.Map<IEnumerable<MedicineResponseDto>>(medicines);
                    
                return Ok(medicineDtos);
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
        [HttpPatch("{id}")]
        [AdminGuard("ACCESS DENIED: Stock manipulation is strictly prohibited for your role.")]
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
        [HttpPatch("{id}/stocks")]
        [AdminGuard("ACCESS DENIED: You are not authorized to modify medicine records.")]
        public async Task<IActionResult> UpdateMedicine(int id, [FromBody] UpdateMedicineDto request)
        {
            try
            {
                // Check if it exists (Optional, but good practice)
                var existingMedicine = await _medicineRepository.GetByIdAsync(id);
                if (existingMedicine == null) return NotFound(new { message = "Medicine not found" });

                _mapper.Map(request, existingMedicine);

                // Save to DB
                bool success = await _medicineRepository.UpdateAsync(existingMedicine);

                if (!success) return BadRequest(new { message = "Failed to update medicine" });

                return Ok(new { message = "Medicine updated successfully" });
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