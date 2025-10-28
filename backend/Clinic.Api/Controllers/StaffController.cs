using Clinic.Api.Data;
using Clinic.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController(ClinicDbContext db) : ControllerBase
{
    // GET /api/Staff
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Staff>>> GetAll([FromQuery] string? search)
    {
        var q = db.Staff.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(x => (
                x.Nom + " " + x.Prenom + " " + x.Role + " " + x.Email
            ).ToLower().Contains(s));
        }
        var items = await q.OrderBy(x => x.Nom).ThenBy(x => x.Prenom).ToListAsync();
        return Ok(items);
    }

    // GET /api/Staff/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Staff>> GetOne(int id)
    {
        var s = await db.Staff.FindAsync(id);
        return s is null ? NotFound() : Ok(s);
    }

    // POST /api/Staff
    [HttpPost]
    public async Task<ActionResult<Staff>> Create([FromBody] Staff s)
    {
        db.Staff.Add(s);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = s.Id }, s);
    }

    // PUT /api/Staff/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Staff s)
    {
        if (id != s.Id) return BadRequest("Id mismatch");
        db.Entry(s).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/Staff/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await db.Staff.FindAsync(id);
        if (s is null) return NotFound();
        db.Staff.Remove(s);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
