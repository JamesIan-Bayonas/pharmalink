using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaLink.API.Attributes;
using PharmaLink.API.DTOs.Categories;
using PharmaLink.API.Interfaces.ServiceInterface;

namespace PharmaLink.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpPost]
        [AdminGuard("ACCESS DENIED: You strictly do not have the privilege to create new categories. Report to your Administrator.")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto request)
        {
            try
            {
                int id = await _categoryService.CreateCategoryAsync(request);
                return Ok(new { id, message = "Category created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [AdminGuard("ACCESS DENIED: You strictly do not have the privilege to modify category details. Report to your Administrator.")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto request)
        {
            try
            {
                bool success = await _categoryService.UpdateCategoryAsync(id, request);
                if (!success)
                    return NotFound(new { message = "Category not found" });

                return Ok(new { message = "Category updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [AdminGuard("ACCESS DENIED: You strictly do not have the privilege to delete categories. Report to your Administrator.")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                bool deleted = await _categoryService.DeleteCategoryAsync(id);
                if (!deleted) return NotFound(new { message = "Category not found" });

                return Ok(new { message = "Category deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}