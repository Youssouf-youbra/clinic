using Clinic.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace Clinic.Api.Data
{
    public static class IdentitySeed
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();

            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            // ✅ Rôles officiels (à utiliser partout : [Authorize(Roles="...")], front, etc.)
            string[] roles = { "Admin", "Doctor", "Staff", "Patient" };

            // 1) Créer les rôles s'ils n'existent pas
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    var roleResult = await roleManager.CreateAsync(new IdentityRole(role));
                    if (!roleResult.Succeeded)
                    {
                        var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
                        throw new InvalidOperationException($"Impossible de créer le rôle '{role}': {errors}");
                    }
                }
            }

            // 2) Créer des comptes de test (pratique pour Swagger)
            async Task CreateUserAsync(string email, string password, string role)
            {
                var existing = await userManager.FindByEmailAsync(email);
                if (existing != null)
                {
                    // S'assurer que le rôle est bien attaché
                    if (!await userManager.IsInRoleAsync(existing, role))
                        await userManager.AddToRoleAsync(existing, role);

                    return;
                }

                var user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(user, password);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Impossible de créer l'utilisateur '{email}': {errors}");
                }

                var addRoleResult = await userManager.AddToRoleAsync(user, role);
                if (!addRoleResult.Succeeded)
                {
                    var errors = string.Join("; ", addRoleResult.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Impossible d'ajouter le rôle '{role}' à '{email}': {errors}");
                }

                // ✅ Claims utiles (facultatif, mais pratique)
                await userManager.AddClaimAsync(user, new System.Security.Claims.Claim("email", email));
                await userManager.AddClaimAsync(user, new System.Security.Claims.Claim("role", role));
            }

            await CreateUserAsync("admin@clinic.com", "Admin123!", "Admin");
            await CreateUserAsync("doc@clinic.com", "Doctor123!", "Doctor");
            await CreateUserAsync("staff@clinic.com", "Staff123!", "Staff");
            await CreateUserAsync("patient@clinic.com", "Patient123!", "Patient");
        }
    }
}
