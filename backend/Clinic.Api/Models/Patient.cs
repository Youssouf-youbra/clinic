using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        // ✅ Relation 1-N : un patient a plusieurs rendez-vous
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        
    }
}
