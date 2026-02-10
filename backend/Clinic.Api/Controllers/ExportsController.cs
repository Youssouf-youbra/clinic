using System.Text;
using Clinic.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Doctor,Staff")]
public class ExportsController : ControllerBase
{
    private readonly ClinicDbContext _db;
    public ExportsController(ClinicDbContext db) => _db = db;

    // GET /api/Exports/patients.csv
    [HttpGet("patients.csv")]
    public async Task<IActionResult> ExportPatientsCsv()
    {
        var patients = await _db.Patients
            .AsNoTracking()
            .OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
            .Select(p => new
            {
                p.Id,
                p.FirstName,
                p.LastName,
                BirthDate = p.BirthDate.HasValue ? p.BirthDate.Value.ToString("yyyy-MM-dd") : "",
                p.Phone,
                p.Email,
                p.Address
            })
            .ToListAsync();

        static string Esc(string? s)
        {
            s ??= "";
            if (s.Contains('"') || s.Contains(',') || s.Contains('\n') || s.Contains('\r'))
                return "\"" + s.Replace("\"", "\"\"") + "\"";
            return s;
        }

        var sb = new StringBuilder();
        sb.AppendLine("Id,FirstName,LastName,BirthDate,Phone,Email,Address");

        foreach (var p in patients)
        {
            sb.AppendLine(
                $"{p.Id},{Esc(p.FirstName)},{Esc(p.LastName)},{Esc(p.BirthDate)},{Esc(p.Phone)},{Esc(p.Email)},{Esc(p.Address)}"
            );
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv; charset=utf-8", $"patients_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }
}
