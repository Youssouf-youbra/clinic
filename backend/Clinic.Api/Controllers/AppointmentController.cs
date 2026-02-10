using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Clinic.Api.Data;
using Clinic.Api.Models;
using Clinic.Api.DTOs;

namespace Clinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly ClinicDbContext _db;
    public AppointmentsController(ClinicDbContext db) => _db = db;

    private bool IsStaffUser()
        => User.IsInRole("Admin") || User.IsInRole("Doctor") || User.IsInRole("Staff")
        || User.IsInRole("Medecin") || User.IsInRole("Personnel");

    // GET /api/Appointments
    [HttpGet]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel,Patient")]
    public async Task<ActionResult<object>> GetAll(
        [FromQuery] int? patientId,
        [FromQuery] int? staffId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var q = _db.Appointments.AsQueryable();

        if (patientId.HasValue) q = q.Where(a => a.PatientId == patientId);
        if (staffId.HasValue) q = q.Where(a => a.StaffId == staffId);

        // Patient -> seulement ses RDV
        if (!IsStaffUser())
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            q = q.Where(a => _db.Patients.Any(p => p.Id == a.PatientId && p.UserId == userId));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderBy(a => a.Date)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AppointmentDto(a.Id, a.PatientId, a.StaffId, a.Date, a.Reason))
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // GET /api/Appointments/{id}
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel,Patient")]
    public async Task<ActionResult<AppointmentDto>> Get(int id)
    {
        var a = await _db.Appointments.FindAsync(id);
        if (a is null) return NotFound();

        if (!IsStaffUser())
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var owns = await _db.Patients.AnyAsync(p => p.Id == a.PatientId && p.UserId == userId);
            if (!owns) return Forbid();
        }

        return new AppointmentDto(a.Id, a.PatientId, a.StaffId, a.Date, a.Reason);
    }

    // POST /api/Appointments
    [HttpPost]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel,Patient")]
    public async Task<ActionResult<AppointmentDto>> Create(CreateAppointmentDto dto)
    {
        var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Id == dto.PatientId);
        if (patient is null)
            return BadRequest(new ProblemDetails { Title = "Patient introuvable." });

        // Patient -> seulement sur lui
        if (!IsStaffUser())
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            if (patient.UserId != userId)
                return Forbid();
        }

        var a = new Appointment
        {
            PatientId = dto.PatientId,
            StaffId = dto.StaffId,
            Date = dto.Date,
            Reason = dto.Reason?.Trim()
        };

        _db.Appointments.Add(a);
        await _db.SaveChangesAsync();

        var result = new AppointmentDto(a.Id, a.PatientId, a.StaffId, a.Date, a.Reason);
        return CreatedAtAction(nameof(Get), new { id = a.Id }, result);
    }

    // PUT /api/Appointments/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel")]
    public async Task<IActionResult> Update(int id, UpdateAppointmentDto dto)
    {
        var a = await _db.Appointments.FindAsync(id);
        if (a is null) return NotFound();

        a.StaffId = dto.StaffId;
        a.Date = dto.Date;
        a.Reason = dto.Reason?.Trim();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/Appointments/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Doctor,Staff,Medecin,Personnel")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _db.Appointments.FindAsync(id);
        if (a is null) return NotFound();

        _db.Appointments.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
