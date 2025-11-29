namespace PharmaLink.API.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using PharmaLink.API.DTOs.Auth;
    using PharmaLink.API.Entities;
    using PharmaLink.API.Interfaces;

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
                var result = await _authService.RegisterAsync(newUser, request.Password);
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
            if (token == null)
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(new { token = token });
        }
    }
}
