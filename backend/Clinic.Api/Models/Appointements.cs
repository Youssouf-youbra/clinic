using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clinic.Api.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        // Patient obligatoire
        [Required]
        public int PatientId { get; set; }

        [ForeignKey(nameof(PatientId))]
        public Patient? Patient { get; set; }

        // Staff FACULTATIF (nullable) → évite les erreurs 23503
        public int? StaffId { get; set; }

        [ForeignKey(nameof(StaffId))]
        public Staff? Staff { get; set; }

        // Date/heure du rendez-vous
        [Required]
        public DateTime Date { get; set; }

        // Motif
        [MaxLength(255)]
        public string? Reason { get; set; }
    }
}
