using AutoMapper;
using PharmaLink.API.Entities;
using PharmaLink.API.DTOs.Auth;
using PharmaLink.API.DTOs.Users;
using PharmaLink.API.DTOs.Categories;
using PharmaLink.API.DTOs.Medicines;

namespace PharmaLink.API.Utilities
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // --- AUTH & USERS ---
            CreateMap<UserRegisterDto, User>(); // Register (DTO -> Entity)
            CreateMap<User, UserResponseDto>(); // Get Users (Entity -> DTO)

            // --- CATEGORIES ---
            CreateMap<CreateCategoryDto, Category>(); // Create
            CreateMap<Category, CategoryResponseDto>(); // Read

            // --- MEDICINES ---
            CreateMap<CreateMedicineDto, Medicine>(); // Create
            CreateMap<UpdateMedicineDto, Medicine>(); // Update
            CreateMap<Medicine, MedicineResponseDto>(); // Read
        }
    }
}