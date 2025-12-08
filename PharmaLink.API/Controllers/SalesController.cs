using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.ServiceInterface;
using PharmaLink.API.Services;

namespace PharmaLink.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize] // It needs a JWT Token
    public class SalesController(ISaleService saleService) : ControllerBase 
    {
        private readonly ISaleService _saleService = saleService;

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

        // PUT: api/Sales/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSale(int id, [FromBody] UpdateSaleDto request)
        {
            // Get Current User ID
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "uid");
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            try
            {
                bool success = await _saleService.UpdateSaleAsync(id, userId, request);
                if (!success) return NotFound(new { message = "Sale not found" });

                return Ok(new { message = "Sale updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // DELETE: api/Sales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            try
            {
                bool success = await _saleService.DeleteSaleAsync(id);
                if (!success) return NotFound(new { message = "Sale not found" });

                return Ok(new { message = "Sale deleted and stock restored successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
