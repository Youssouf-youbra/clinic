using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clinic.Api.Models
{
    public class MedicalNote
    {
        [Key] public int Id { get; set; }

        [Required] public int MedicalRecordId { get; set; }
        [ForeignKey(nameof(MedicalRecordId))] public MedicalRecord? MedicalRecord { get; set; }

        // Auteur (staff) – nullable pour éviter les blocages si l’auteur est supprimé
        public int? StaffId { get; set; }
        [ForeignKey(nameof(StaffId))] public Staff? Staff { get; set; }

        [Required, MaxLength(2000)] public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
