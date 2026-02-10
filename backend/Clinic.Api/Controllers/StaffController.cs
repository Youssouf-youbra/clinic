using Clinic.Api.Data;
using Clinic.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StaffController : ControllerBase
{
    private readonly ClinicDbContext _db;

    public StaffController(ClinicDbContext db)
    {
        _db = db;
    }

    // ✅ LECTURE : Admin + Medecin peuvent voir la liste
    [HttpGet]
    [Authorize(Roles = "Admin,Medecin")]
    public async Task<ActionResult<IEnumerable<Staff>>> GetStaff()
    {
        var list = await _db.Staff
            .OrderBy(s => s.Nom)
            .ThenBy(s => s.Prenom)
            .ToListAsync();

        return Ok(list);
    }

    // ✅ CREATION : réservé à Admin
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Staff>> CreateStaff([FromBody] Staff staff)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _db.Staff.Add(staff);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStaff), new { id = staff.Id }, staff);
    }

    // ✅ MISE A JOUR : réservé à Admin
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStaff(int id, [FromBody] Staff staff)
    {
        if (id != staff.Id)
            return BadRequest("Id mismatch.");

        _db.Entry(staff).State = EntityState.Modified;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // ✅ SUPPRESSION : réservé à Admin
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteStaff(int id)
    {
        var entity = await _db.Staff.FindAsync(id);
        if (entity == null)
            return NotFound();

        _db.Staff.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
