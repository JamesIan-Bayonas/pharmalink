using PharmaLink.API.DTOs.Categories;

namespace PharmaLink.API.Interfaces.ServiceInterface
{
    public interface ICategoryService
    {
        Task<int> CreateCategoryAsync(CreateCategoryDto request);
        Task<IEnumerable<CategoryResponseDto>> GetAllCategoriesAsync();
        Task<bool> DeleteCategoryAsync(int id);
        Task<bool> UpdateCategoryAsync(int id, UpdateCategoryDto request);
    }
}