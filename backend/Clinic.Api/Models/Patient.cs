using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Clinic.Api.Models;

namespace Clinic.Api.Models
{
    public class Patient
    {
        public int Id { get; set; }

        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        public DateOnly? BirthDate { get; set; }

        [MaxLength(25)]
        public string? Phone { get; set; }

        [MaxLength(200)]
        public string? Email { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        // 🔐 Liaison vers le compte Identity (ApplicationUser)
        public string? UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public ApplicationUser? User { get; set; }

        // Relations
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    }
}
