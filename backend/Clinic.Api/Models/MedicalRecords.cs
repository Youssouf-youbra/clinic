using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clinic.Api.Models
{
    public class MedicalRecord
    {
        [Key] public int Id { get; set; }

        [Required] public int PatientId { get; set; }
        [ForeignKey(nameof(PatientId))] public Patient? Patient { get; set; }

        [MaxLength(120)] public string? Allergies { get; set; }
        [MaxLength(120)] public string? BloodType { get; set; } // A+, O-, etc.
        [MaxLength(500)] public string? ChronicDiseases { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<MedicalNote> Notes { get; set; } = new List<MedicalNote>();
    }
}
