using AutoMapper;
using PharmaLink.API.DTOs.Categories;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;

namespace PharmaLink.API.Services
{
    public class CategoryService(ICategoryRepository categoryRepository, IMapper mapper) : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository = categoryRepository;

        public async Task<int> CreateCategoryAsync(CreateCategoryDto request)
        {
            var newCategory = mapper.Map<Category>(request);
            return await _categoryRepository.CreateAsync(newCategory);
        }

        public async Task<IEnumerable<CategoryResponseDto>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return mapper.Map<IEnumerable<CategoryResponseDto>>(categories);
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            return await _categoryRepository.DeleteAsync(id);
        }
        public async Task<bool> UpdateCategoryAsync(int id, UpdateCategoryDto request)
        {
            var existingCategory = await _categoryRepository.GetByIdAsync(id);
            if (existingCategory == null) return false;

            existingCategory.Name = request.Name;

            return await _categoryRepository.UpdateAsync(existingCategory);
        }
    }
}