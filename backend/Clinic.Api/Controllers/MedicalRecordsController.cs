using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Clinic.Api.Data;
using Clinic.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // 🔒 Tout le contrôleur protégé
public class MedicalRecordsController : ControllerBase
{
    private readonly ClinicDbContext _db;
    public MedicalRecordsController(ClinicDbContext db) => _db = db;

    private bool IsAdminDoctorStaff()
        => User.IsInRole("Admin") || User.IsInRole("Doctor") || User.IsInRole("Staff");

    private string? CurrentUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier);

    // ================== DTOs ==================

    public record MedicalNoteDto(
        int Id,
        int? StaffId,
        string? StaffName,
        string Content,
        DateTime CreatedAt
    );

    public record MedicalRecordDto(
        int Id,
        int PatientId,
        string? Allergies,
        string? BloodType,
        string? ChronicDiseases,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        List<MedicalNoteDto> Notes
    );

    public record CreateMedicalRecordDto(
        int PatientId,
        string? Allergies,
        string? BloodType,
        string? ChronicDiseases
    );

    public record CreateNoteDto(string Content);
    public record UpdateNoteDto(string Content);

    // ================== MAPPERS ==================

    private static MedicalNoteDto ToDto(MedicalNote n) =>
        new(
            n.Id,
            n.StaffId,
            n.Staff is null ? null : $"{n.Staff.Prenom} {n.Staff.Nom}",
            n.Content,
            n.CreatedAt
        );

    private static MedicalRecordDto ToDto(MedicalRecord mr) =>
        new(
            mr.Id,
            mr.PatientId,
            mr.Allergies,
            mr.BloodType,
            mr.ChronicDiseases,
            mr.CreatedAt,
            mr.UpdatedAt,
            (mr.Notes ?? new List<MedicalNote>())
                .OrderByDescending(n => n.CreatedAt)
                .Select(ToDto)
                .ToList()
        );

    // ================== HELPERS ==================

    private async Task<bool> PatientBelongsToCurrentUser(int patientId)
    {
        var userId = CurrentUserId();
        if (string.IsNullOrWhiteSpace(userId)) return false;

        return await _db.Patients.AnyAsync(p => p.Id == patientId && p.UserId == userId);
    }

    // ================== ENDPOINTS ==================

    // GET: /api/MedicalRecords -> liste de tous les dossiers
    // 🔒 réservé au personnel
    [HttpGet]
    [Authorize(Roles = "Admin,Doctor,Staff")]
    public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetAll()
    {
        var records = await _db.MedicalRecords
            .Include(mr => mr.Notes)
                .ThenInclude(n => n.Staff)
            .OrderByDescending(mr => mr.UpdatedAt ?? mr.CreatedAt)
            .ToListAsync();

        return Ok(records.Select(ToDto));
    }

    // GET: /api/MedicalRecords/patient/5 -> dernier dossier d’un patient
    // 🔒 Patient autorisé seulement si c'est lui, sinon staff/admin
    [HttpGet("patient/{patientId:int}")]
    public async Task<ActionResult<MedicalRecordDto>> GetByPatient(int patientId)
    {
        if (!IsAdminDoctorStaff())
        {
            var owns = await PatientBelongsToCurrentUser(patientId);
            if (!owns) return Forbid();
        }

        var record = await _db.MedicalRecords
            .Include(mr => mr.Notes)
                .ThenInclude(n => n.Staff)
            .Where(mr => mr.PatientId == patientId)
            .OrderByDescending(mr => mr.Id)
            .FirstOrDefaultAsync();

        if (record is null)
            return NotFound();

        return Ok(ToDto(record));
    }

    // POST: /api/MedicalRecords -> créer un dossier
    // 🔒 réservé au personnel
    [HttpPost]
    [Authorize(Roles = "Admin,Doctor,Staff")]
    public async Task<ActionResult<MedicalRecordDto>> Create([FromBody] CreateMedicalRecordDto input)
    {
        var patientExists = await _db.Patients.AnyAsync(p => p.Id == input.PatientId);
        if (!patientExists)
            return NotFound($"Patient {input.PatientId} introuvable.");

        var record = new MedicalRecord
        {
            PatientId = input.PatientId,
            Allergies = input.Allergies,
            BloodType = input.BloodType,
            ChronicDiseases = input.ChronicDiseases,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Notes = new List<MedicalNote>()
        };

        _db.MedicalRecords.Add(record);
        await _db.SaveChangesAsync();

        await _db.Entry(record).Collection(r => r.Notes).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = record.Id }, ToDto(record));
    }

    // GET: /api/MedicalRecords/7
    // 🔒 Patient autorisé seulement si c'est son dossier, sinon staff/admin
    [HttpGet("{id:int}")]
    public async Task<ActionResult<MedicalRecordDto>> GetById(int id)
    {
        var rec = await _db.MedicalRecords
            .Include(mr => mr.Notes)
                .ThenInclude(n => n.Staff)
            .FirstOrDefaultAsync(mr => mr.Id == id);

        if (rec is null) return NotFound();

        if (!IsAdminDoctorStaff())
        {
            var owns = await PatientBelongsToCurrentUser(rec.PatientId);
            if (!owns) return Forbid();
        }

        return Ok(ToDto(rec));
    }

    // POST: /api/MedicalRecords/{id}/notes -> ajouter une note
    // 🔒 réservé au personnel (un patient ne devrait pas écrire des notes médicales)
    [HttpPost("{id:int}/notes")]
    [Authorize(Roles = "Admin,Doctor,Staff")]
    public async Task<ActionResult<MedicalNoteDto>> AddNote(int id, [FromBody] CreateNoteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Le contenu de la note est requis.");

        // Charger le dossier (utile aussi pour UpdatedAt)
        var record = await _db.MedicalRecords.FirstOrDefaultAsync(mr => mr.Id == id);
        if (record is null)
            return NotFound($"Dossier {id} introuvable.");

        // Identifier le staff connecté par email (token)
        int? staffId = null;
        var email =
            User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Email);

        if (!string.IsNullOrWhiteSpace(email))
        {
            var staff = await _db.Staff.FirstOrDefaultAsync(s => s.Email.ToLower() == email.ToLower());
            if (staff != null) staffId = staff.Id;
        }

        var note = new MedicalNote
        {
            MedicalRecordId = id,
            StaffId = staffId,
            Content = dto.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.MedicalNotes.Add(note);

        // Update dossier (traçabilité)
        record.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _db.Entry(note).Reference(n => n.Staff).LoadAsync();
        return Ok(ToDto(note));
    }

    // PUT: /api/MedicalRecords/notes/12 -> modifier une note
    // 🔒 réservé au personnel
    [HttpPut("notes/{noteId:int}")]
    [Authorize(Roles = "Admin,Doctor,Staff")]
    public async Task<ActionResult<MedicalNoteDto>> UpdateNote(int noteId, [FromBody] UpdateNoteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Le contenu de la note est requis.");

        var note = await _db.MedicalNotes
            .Include(n => n.Staff)
            .FirstOrDefaultAsync(n => n.Id == noteId);

        if (note is null) return NotFound();

        note.Content = dto.Content.Trim();

        // Update UpdatedAt du dossier
        var record = await _db.MedicalRecords.FirstOrDefaultAsync(mr => mr.Id == note.MedicalRecordId);
        if (record != null) record.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToDto(note));
    }

    // DELETE: /api/MedicalRecords/notes/12 -> supprimer une note
    // 🔒 réservé au personnel
    [HttpDelete("notes/{noteId:int}")]
    [Authorize(Roles = "Admin,Doctor,Staff")]
    public async Task<IActionResult> DeleteNote(int noteId)
    {
        var note = await _db.MedicalNotes.FindAsync(noteId);
        if (note is null) return NotFound();

        _db.MedicalNotes.Remove(note);

        // Update UpdatedAt du dossier
        var record = await _db.MedicalRecords.FirstOrDefaultAsync(mr => mr.Id == note.MedicalRecordId);
        if (record != null) record.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
