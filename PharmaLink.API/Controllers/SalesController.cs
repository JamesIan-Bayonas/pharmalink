using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using PharmaLink.API.Services;

namespace PharmaLink.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize] // It needs a JWT Token
    public class SalesController : ControllerBase 
    {
        private readonly ISaleService _saleService;
        public SalesController(ISaleService saleService)
        {
            _saleService = saleService;
        }

        [HttpPost()] 
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleRequestDto request)
        {
            // Extract UserId from the JWT Token claims
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "uid");
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);
            try
            {
                var saleId = await _saleService.ProcessSaleAsync(userId, request);
                return CreatedAtAction(nameof(GetSaleById), new { id = saleId }, new { message = "Sale successful", saleId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSaleById(int id)
        {
            try
            {
                var saleDto = await _saleService.GetSaleByIdAsync(id);
                if (saleDto == null) return NotFound(new { message = "Sale not found" });

                return Ok(saleDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSales()
        {
            try
            {
                var sales = await _saleService.GetAllSalesAsync();
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
