using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaLink.API.Attributes;
using PharmaLink.API.DTOs.Auth;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.ServiceInterface;

namespace PharmaLink.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IMapper _mapper;

        public AuthController(IAuthService authService, IMapper mapper)
        {
            _authService = authService;
            _mapper = mapper;
        }

        [HttpGet("me")]
        [Authorize] // Requires Login
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                // Get User ID from the Token
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "uid");
                if (userIdClaim == null) return Unauthorized();

                int userId = int.Parse(userIdClaim.Value);

                // Fetch fresh data from Database (NOT the token)
                var userDto = await _authService.GetCurrentUserAsync(userId);

                if (userDto == null) return NotFound();

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("users/{id}")]
        [AdminGuard("Admin Only")] // Security: Only Admins can access
        public async Task<IActionResult> UpdateUserAsAdmin(int id, [FromBody] UserUpdateDto request)
        {
            try
            {
                // Check if user exists by calling AuthService.UpdateUserAsync with the ID from the URL, not the token.
                var success = await _authService.UpdateUserAsync(id, request);

                if (!success) return BadRequest(new { message = "Failed to update user." });

                return Ok(new { message = "User updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto request)
        {
            try
            {
                var newUser = _mapper.Map<User>(request);
                var result = await _authService.RegisterAsync(newUser, request.Password, request.Role);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto request)
        {
            var token = await _authService.LoginAsync(request.Username, request.Password);
            if (string.IsNullOrEmpty(token))
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(new { token = token });
        }

        [HttpGet("users")]
        [AdminGuard("ACCESS DENIED: You strictly do not have the privilege to view user records. Report to your Administrator.")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _authService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateCredentials([FromBody] UserUpdateDto request)
        {
            try
            {
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "uid");
                if (userIdClaim == null) return Unauthorized();

                int userId = int.Parse(userIdClaim.Value);

                bool success = await _authService.UpdateUserAsync(userId, request);

                if (!success) return BadRequest(new { message = "Update failed" });

                return Ok(new { message = "Credentials updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpDelete("delete/{id}")] 
        [AdminGuard("Admin Only")]  
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
             
                var success = await _authService.DeleteUserAsync(id);

              
                if (!success) return NotFound(new { message = "User not found" });

                
                return Ok(new { message = "User deleted successfully by Admin." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
    }
