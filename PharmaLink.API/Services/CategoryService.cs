using PharmaLink.API.DTOs.Categories;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;

namespace PharmaLink.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<int> CreateCategoryAsync(CreateCategoryDto request)
        {
            var newCategory = new Category
            {
                Name = request.Name
            };
            return await _categoryRepository.CreateAsync(newCategory);
        }

        public async Task<IEnumerable<CategoryResponseDto>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name
            });
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            return await _categoryRepository.DeleteAsync(id);
        }
    }
}