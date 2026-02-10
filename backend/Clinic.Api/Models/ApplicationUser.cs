using Microsoft.AspNetCore.Identity;

namespace Clinic.Api.Models
{
    // Utilisateur de ton système (lié plus tard au staff/patient si tu veux)
    public class ApplicationUser : IdentityUser
    {
        // Optionnel : si tu veux relier un compte à un membre du personnel
        public int? StaffId { get; set; }
        public Staff? Staff { get; set; }

        // Plus tard on pourra ajouter PatientId, etc. si besoin
        // public int? PatientId { get; set; }
        // public Patient? Patient { get; set; }
    }
}
