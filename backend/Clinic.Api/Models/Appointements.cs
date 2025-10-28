using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clinic.Api.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [ForeignKey("PatientId")]
        public Patient? Patient { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [MaxLength(255)]
        public string? Reason { get; set; }
    }
}
