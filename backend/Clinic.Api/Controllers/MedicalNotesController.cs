using Clinic.Api.Data;
using Clinic.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalNotesController : ControllerBase
    {
        private readonly ClinicDbContext _db;

        public MedicalNotesController(ClinicDbContext db)
        {
            _db = db;
        }

        // GET: api/MedicalNotes/record/5
        [HttpGet("record/{recordId}")]
        public async Task<ActionResult<IEnumerable<MedicalNote>>> GetNotes(int recordId)
        {
            return await _db.MedicalNotes
                .Where(n => n.MedicalRecordId == recordId)
                .Include(n => n.Staff)
                .ToListAsync();
        }

        // POST: api/MedicalNotes
        [HttpPost]
        public async Task<ActionResult<MedicalNote>> Create(MedicalNote note)
        {
            _db.MedicalNotes.Add(note);
            await _db.SaveChangesAsync();
            return Ok(note);
        }
    }
}
