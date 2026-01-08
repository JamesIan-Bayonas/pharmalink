using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaLink.API.Interfaces;
using PharmaLink.API.Interfaces.RepositoryInterface;
using System.Security.Claims;

namespace PharmaLink.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Only logged-in users can upload their own photo
    public class UsersController(IUserRepository userRepository, IWebHostEnvironment environment) : ControllerBase
    {
        [HttpPost("upload-photo")]
        public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
        {
            // VALIDATION: Check if file is empty
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            // VALIDATION: File Size (Max 2MB)
            const long maxFileSize = 2 * 1024 * 1024; // 2MB
            if (file.Length > maxFileSize)
                return BadRequest(new { message = "File size exceeds 2MB limit." });

            // VALIDATION: File Type (Only Images)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Only JPG, JPEG, and PNG are allowed." });

            try
            {
                // Determine the correct root path. 
                // environment.WebRootPath usually points to ".../wwwroot". 
                string webRootPath = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");

                // Now we simply append "uploads" (avoiding the "wwwroot/wwwroot" duplication)
                string uploadsFolder = Path.Combine(webRootPath, "uploads");

                // Create folder if it doesn't exist
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // GENERATE UNIQUE FILENAME (Guid + Extension)
                string uniqueFileName = Guid.NewGuid().ToString() + extension;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // SAVE FILE TO LOCAL DISK
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // SAVE PATH TO DATABASE
                // Get current User ID from JWT Token
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "uid");
                if (userIdClaim == null) return Unauthorized();

                int userId = int.Parse(userIdClaim.Value);

                // Store relative path (e.g., "uploads/abc-123.jpg") so frontend can access it
                string relativePath = $"uploads/{uniqueFileName}";

                await userRepository.UpdateProfileImageAsync(userId, relativePath);

                // RETURN URL
                // Construct full URL for the response
                var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                var fullUrl = $"{baseUrl}/{relativePath}";

                return Ok(new { message = "Upload successful", imageUrl = fullUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error: " + ex.Message });
            }
        }
    }
}