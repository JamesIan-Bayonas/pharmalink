namespace PharmaLink.API.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using PharmaLink.API.DTOs.Auth;
    using PharmaLink.API.Entities;
    using PharmaLink.API.Interfaces.ServiceInterface;

    // 1. Auth Controller (New!)
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        /// <summary>
        /// Handles authentication logic. See <see cref="AuthService"/> for implementation.
        /// </summary>
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto request) 
        {
            try
            {
                var newUser = new User { UserName = request.UserName };
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
        [Authorize(Roles = "Admin")] // <--- CRITICAL: Only Admins can see the user list!
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
                // Identify WHO is making the request (from the Token)
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "uid");
                if (userIdClaim == null) return Unauthorized();

                int userId = int.Parse(userIdClaim.Value);

                // Call Service
                bool success = await _authService.UpdateUserAsync(userId, request);

                if (!success) return BadRequest(new { message = "Update failed" });

                return Ok(new { message = "Credentials updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Auth/delete
        [HttpDelete("delete")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            try
            {
                // Identify WHO is making the request
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "uid");
                if (userIdClaim == null) return Unauthorized();

                int userId = int.Parse(userIdClaim.Value);

                // Call Service
                bool success = await _authService.DeleteUserAsync(userId);

                if (!success) return NotFound(new { message = "User not found" });

                return Ok(new { message = "Account deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
    }
}
