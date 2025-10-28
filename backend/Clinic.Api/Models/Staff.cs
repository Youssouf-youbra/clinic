namespace Clinic.Api.Models;

using System.ComponentModel.DataAnnotations;

public class Staff
{
    public int Id { get; set; }

    [Required, MaxLength(80)]
    public string Nom { get; set; } = "";

    [Required, MaxLength(80)]
    public string Prenom { get; set; } = "";

    // "Medecin" | "Infirmier" | "Secretaire"
    [Required, MaxLength(40)]
    public string Role { get; set; } = "Medecin";

    [Required, EmailAddress, MaxLength(120)]
    public string Email { get; set; } = "";
}
