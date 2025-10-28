using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Clinic.Api.Data;
using Clinic.Api.Models;
using Clinic.Api.DTOs;

namespace Clinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly ClinicDbContext _db;
    public AppointmentsController(ClinicDbContext db) => _db = db;

    // GET /api/Appointments?patientId=&page=1&pageSize=10
    [HttpGet]
    public async Task<ActionResult<object>> GetAll([FromQuery] int? patientId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var q = _db.Appointments.AsQueryable();
        if (patientId.HasValue) q = q.Where(a => a.PatientId == patientId);

        var total = await q.CountAsync();
        var items = await q
            .OrderBy(a => a.Date)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AppointmentDto(a.Id, a.PatientId, a.Date, a.Reason))
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // GET /api/Appointments/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentDto>> Get(int id)
    {
        var a = await _db.Appointments.FindAsync(id);
        if (a is null) return NotFound();
        return new AppointmentDto(a.Id, a.PatientId, a.Date, a.Reason);
    }

    // POST /api/Appointments
    [HttpPost]
    public async Task<ActionResult<AppointmentDto>> Create(CreateAppointmentDto dto)
    {
        if (!await _db.Patients.AnyAsync(p => p.Id == dto.PatientId))
            return BadRequest(new ProblemDetails { Title = "Patient introuvable." });

        var a = new Appointment
        {
            PatientId = dto.PatientId,
            Date = dto.Date,
            Reason = dto.Reason?.Trim()
        };

        _db.Appointments.Add(a);
        await _db.SaveChangesAsync();

        var result = new AppointmentDto(a.Id, a.PatientId, a.Date, a.Reason);
        return CreatedAtAction(nameof(Get), new { id = a.Id }, result);
    }

    // PUT /api/Appointments/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateAppointmentDto dto)
    {
        var a = await _db.Appointments.FindAsync(id);
        if (a is null) return NotFound();

        a.Date = dto.Date;
        a.Reason = dto.Reason?.Trim();
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/Appointments/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _db.Appointments.FindAsync(id);
        if (a is null) return NotFound();

        _db.Appointments.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
