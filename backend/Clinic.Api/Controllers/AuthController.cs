using Clinic.Api.Data;
using Clinic.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Clinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _config;
        private readonly ClinicDbContext _db;

       private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
{
    "Patient", "Medecin", "Personnel", "Admin"
};


        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration config,
            ClinicDbContext db)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
            _db = db;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email et mot de passe requis.");

            var existing = await _userManager.FindByEmailAsync(dto.Email);
            if (existing != null)
                return BadRequest("Cet email est déjà utilisé.");

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                StaffId = dto.StaffId,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var roleToAssign = "Patient";

            if (!string.IsNullOrWhiteSpace(dto.Role))
            {
                var requested = dto.Role.Trim();

                if (!AllowedRoles.Contains(requested))
                    return BadRequest("Rôle invalide.");

                if (requested.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                    return BadRequest("Création Admin interdite via register.");

                roleToAssign = requested;
            }

            await _userManager.AddToRoleAsync(user, roleToAssign);

            // ✅ Lier automatiquement un Patient au compte (UserId)
            if (roleToAssign.Equals("Patient", StringComparison.OrdinalIgnoreCase))
            {
                var alreadyLinked = await _db.Patients.AnyAsync(p => p.UserId == user.Id);
                if (!alreadyLinked)
                {
                    var patient = new Patient
                    {
                        UserId = user.Id,
                        Email = user.Email,
                        FirstName = "",
                        LastName = ""
                    };

                    _db.Patients.Add(patient);
                    await _db.SaveChangesAsync();
                }
            }

            return Ok(new { Message = "Compte créé avec succès", Role = roleToAssign });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return Unauthorized("Email incorrect");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded) return Unauthorized("Mot de passe incorrect");

            var token = await GenerateJwtToken(user);
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new { token, roles });
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var jwtSection = _config.GetSection("Jwt");
            var keyStr = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
            var issuer = jwtSection["Issuer"] ?? "ClinicApi";
            var audience = jwtSection["Audience"] ?? issuer;

            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim("email", user.Email ?? "")
            };

            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class RegisterDto
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string? Role { get; set; }
        public int? StaffId { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}
