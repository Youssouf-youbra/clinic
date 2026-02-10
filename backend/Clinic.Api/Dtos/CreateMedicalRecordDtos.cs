using System;

namespace Clinic.Api.DTOs
{
    public class CreateMedicalRecordDto
    {
        public int PatientId { get; set; }
        public string? Allergies { get; set; }
        public string? BloodType { get; set; }
        public string? ChronicDiseases { get; set; }
    }
}
