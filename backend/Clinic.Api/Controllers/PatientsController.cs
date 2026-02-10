using System.Security.Claims;
using Clinic.Api.Data;
using Clinic.Api.DTOs;
using Clinic.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientsController(ClinicDbContext db) : ControllerBase
{
    private static PatientDto ToDto(Patient p) =>
        new(p.Id, p.FirstName, p.LastName, p.BirthDate, p.Phone, p.Email, p.Address);

    private bool IsAdminDoctorStaffMedecinPersonnel()
        => User.IsInRole("Admin") || User.IsInRole("Doctor") || User.IsInRole("Staff")
        || User.IsInRole("Medecin") || User.IsInRole("Personnel");

    private string? CurrentUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier);

    // GET /api/patients?query=&page=1&pageSize=10
    [HttpGet]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 10;

        var q = db.Patients.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            q = q.Where(p =>
                p.FirstName.Contains(query) ||
                p.LastName.Contains(query) ||
                (p.Email != null && p.Email.Contains(query)) ||
                (p.Phone != null && p.Phone.Contains(query)));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => ToDto(p))
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // GET /api/patients/{id}
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel,Patient")]
    public async Task<ActionResult<PatientDto>> GetById(int id)
    {
        var item = await db.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (item is null) return NotFound();

        // Patient: seulement sa fiche
        if (!IsAdminDoctorStaffMedecinPersonnel())
        {
            var userId = CurrentUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            if (item.UserId != userId) return Forbid();
        }

        return Ok(ToDto(item));
    }

    // POST /api/patients
    [HttpPost]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel")]
    public async Task<ActionResult<PatientDto>> Create([FromBody] CreatePatientDto input)
    {
        var entity = new Patient
        {
            FirstName = input.FirstName,
            LastName = input.LastName,
            BirthDate = input.BirthDate,
            Phone = input.Phone,
            Email = input.Email,
            Address = input.Address
        };

        db.Patients.Add(entity);
        await db.SaveChangesAsync();

        var dto = ToDto(entity);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
    }

    // PUT /api/patients/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePatientDto input)
    {
        var entity = await db.Patients.FirstOrDefaultAsync(p => p.Id == id);
        if (entity is null) return NotFound();

        entity.FirstName = input.FirstName;
        entity.LastName = input.LastName;
        entity.BirthDate = input.BirthDate;
        entity.Phone = input.Phone;
        entity.Email = input.Email;
        entity.Address = input.Address;

        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/patients/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.Patients.FindAsync(id);
        if (entity is null) return NotFound();

        db.Patients.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
